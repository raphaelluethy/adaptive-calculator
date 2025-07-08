import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../lib/trpc";
import { db } from "../db";
import { logs, sessions } from "../db/schema/logs";
import { user } from "../db/schema/auth"; // Corrected import
import { nanoid } from "nanoid";
import { sql, eq, and, gt } from "drizzle-orm";

const fifteenMinutesAgo = () => new Date(Date.now() - 15 * 60 * 1000);

export const logsRouter = createTRPCRouter({
  createLog: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        type: z.enum(["new-page", "mouse-position", "clicked"]),
        data: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
        await tx.insert(logs).values({
          sessionId: input.sessionId,
          type: input.type,
          data: input.data,
          date: new Date(), // Drizzle default should also work
        });
        await tx
          .update(sessions)
          .set({ lastLogAt: new Date(), updatedAt: new Date() })
          .where(eq(sessions.id, input.sessionId));
      });
      return { success: true };
    }),

  getSession: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      let currentSession = null;
      if (input.userId) {
        currentSession = await db.query.sessions.findFirst({
          where: and(
            eq(sessions.userId, input.userId),
            gt(sessions.lastLogAt, fifteenMinutesAgo())
          ),
          orderBy: [sql`${sessions.lastLogAt} DESC`],
        });
      }

      if (currentSession) {
        // Update lastLogAt to keep session alive, even if just fetching it
        // This might be too aggressive, could be removed if session should only extend on actual logging
        await db
          .update(sessions)
          .set({ lastLogAt: new Date() })
          .where(eq(sessions.id, currentSession.id));
        return currentSession;
      }

      // Create a new session
      const newSessionId = nanoid();
      await db.insert(sessions).values({
        id: newSessionId,
        userId: input.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogAt: new Date(),
      });
      return { id: newSessionId, userId: input.userId, lastLogAt: new Date() };
    }),

  createSession: publicProcedure // Explicitly create a new session
    .input(z.object({ userId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const newSessionId = nanoid();
      await db.insert(sessions).values({
        id: newSessionId,
        userId: input.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogAt: new Date(),
      });
      return { id: newSessionId, userId: input.userId };
    }),

  endSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Soft delete by setting lastLogAt to a very old date
      // or could add an `active` flag or `endedAt` timestamp
      await db
        .update(sessions)
        .set({
          lastLogAt: new Date(0), // Epoch time
          updatedAt: new Date()
        })
        .where(eq(sessions.id, input.sessionId));
      return { success: true };
    }),
});

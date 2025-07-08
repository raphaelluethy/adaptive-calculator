import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { logSessions, logs } from "@/db/schema/logs";
import { protectedProcedure, router } from "@/lib/trpc";

const logType = z.enum(["new-page", "mouse-position", "clicked"]);

export const logsRouter = router({
	createSession: protectedProcedure.mutation(async ({ ctx }) => {
		try {
			const [session] = await db
				.insert(logSessions)
				.values({ userId: ctx.session.user.id })
				.returning({ id: logSessions.id });
			return { id: session.id };
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to create session",
			});
		}
	}),
	createLog: protectedProcedure
		.input(
			z.object({
				sessionId: z.string(),
				type: logType,
				data: z.any(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			let sessionId = input.sessionId;
			try {
				const lastLog = await db
					.select({ date: logs.date })
					.from(logs)
					.where(eq(logs.sessionId, sessionId))
					.orderBy(desc(logs.date))
					.limit(1);

				if (
					lastLog.length === 0 ||
					Date.now() - new Date(lastLog[0].date).getTime() > 900000
				) {
					const [newSession] = await db
						.insert(logSessions)
						.values({ userId: ctx.session.user.id })
						.returning({ id: logSessions.id });
					sessionId = newSession.id;
				}

				await db.insert(logs).values({
					sessionId,
					type: input.type,
					data: JSON.stringify(input.data),
				});

				return { sessionId };
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create log",
				});
			}
		}),
});

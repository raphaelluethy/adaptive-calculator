import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
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
			console.error(error);
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
				console.error(error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create log",
				});
			}
		}),
	getMousePositions: protectedProcedure.query(async ({ ctx }) => {
		try {
			if (!ctx.session.user.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not logged in",
				});
			}
			const userSessions = await db
				.select({ id: logSessions.id })
				.from(logSessions)
				.where(eq(logSessions.userId, ctx.session.user.id));

			const sessionIds = userSessions.map((s) => s.id);

			if (sessionIds.length === 0) {
				return [];
			}

			const mousePositions = await db
				.select({
					id: logs.id,
					date: logs.date,
					data: logs.data,
				})
				.from(logs)
				.where(
					and(
						eq(logs.type, "mouse-position"),
						inArray(logs.sessionId, sessionIds),
					),
				)
				.orderBy(desc(logs.date))
				.limit(1000);

			return mousePositions.map((log) => ({
				id: log.id,
				timestamp: log.date,
				...JSON.parse(log.data as string),
			}));
		} catch (error) {
			console.error(error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch mouse positions",
			});
		}
	}),
	getClickEvents: protectedProcedure.query(async ({ ctx }) => {
		try {
			const userSessions = await db
				.select({ id: logSessions.id })
				.from(logSessions)
				.where(eq(logSessions.userId, ctx.session.user.id));

			const sessionIds = userSessions.map((s) => s.id);

			if (sessionIds.length === 0) {
				return [];
			}

			const clickEvents = await db
				.select({
					id: logs.id,
					date: logs.date,
					data: logs.data,
				})
				.from(logs)
				.where(
					and(eq(logs.type, "clicked"), inArray(logs.sessionId, sessionIds)),
				)
				.orderBy(desc(logs.date))
				.limit(500);

			return clickEvents.map((log) => ({
				id: log.id,
				timestamp: log.date,
				...JSON.parse(log.data as string),
			}));
		} catch (error) {
			console.error(error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch click events",
			});
		}
	}),
});

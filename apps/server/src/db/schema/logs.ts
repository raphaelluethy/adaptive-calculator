import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./auth";

export const logSessions = sqliteTable("log_sessions", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text("user_id").references(() => user.id),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const logs = sqliteTable("logs", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	sessionId: text("session_id")
		.notNull()
		.references(() => logSessions.id),
	date: integer("date", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	type: text("type", {
		enum: ["new-page", "mouse-position", "clicked"],
	}).notNull(),
	data: text("data", { mode: "json" }).notNull(),
});

export type LogSession = typeof logSessions.$inferSelect;
export type Log = typeof logs.$inferSelect;

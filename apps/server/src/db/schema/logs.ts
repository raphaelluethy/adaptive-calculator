import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./auth";

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text("user_id").references(() => user.id), // Nullable, as sessions can be anonymous
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  lastLogAt: integer("last_log_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const logs = sqliteTable("logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  date: integer("date", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  type: text("type", {
    enum: ["new-page", "mouse-position", "clicked"],
  }).notNull(),
  data: text("data", { mode: "json" }), // JSON field for flexible data storage
});

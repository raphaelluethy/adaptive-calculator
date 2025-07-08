import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const featureFlags = sqliteTable("feature_flags", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	flag: text("flag").notNull().unique(),
	value: integer("value", { mode: "boolean" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	type: text("type", {
		enum: ["theme", "ui", "functionality", "other"],
	}).notNull(),
});

export const featureFlagExcludes = sqliteTable("feature_flag_excludes", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	flag: text("flag")
		.references(() => featureFlags.flag)
		.notNull(),
	excludedFlag: text("excluded_flag")
		.references(() => featureFlags.flag)
		.notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export type SchemaFeatureFlag = typeof featureFlags.$inferSelect;

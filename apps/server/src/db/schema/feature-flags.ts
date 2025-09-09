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
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	type: text("type", {
		enum: ["theme", "ui", "functionality", "other"],
	}).notNull(),
});

export type SchemaFeatureFlag = typeof featureFlags.$inferSelect;
export type FeatureFlagType = (typeof featureFlags.type.enumValues)[number];
export const FEATURE_FLAG_TYPES = featureFlags.type.enumValues;

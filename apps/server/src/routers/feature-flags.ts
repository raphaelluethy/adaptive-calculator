import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { featureFlagExcludes, featureFlags } from "@/db/schema/feature-flags";
import { publicProcedure, router } from "@/lib/trpc";

export const defaultFeatureFlags = {
	chatBox: {
		flag: "chat-box",
		value: true,
		excludes: [],
		type: "ui",
	},
	defaultRender: {
		flag: "default-render",
		value: true,
		excludes: ["sdui"],
		type: "ui",
	},
	sdui: {
		flag: "sdui",
		value: false,
		excludes: ["default-render"],
		type: "ui",
	},
	lightTheme: {
		flag: "light-theme",
		value: false,
		excludes: [
			"dark-theme",
			"tokyo-night-theme",
			"monokai-theme",
			"post-modern-theme",
			"default-theme",
		],
		type: "theme",
	},
	darkTheme: {
		flag: "dark-theme",
		value: false,
		excludes: [
			"light-theme",
			"tokyo-night-theme",
			"monokai-theme",
			"post-modern-theme",
			"default-theme",
		],
		type: "theme",
	},
	tokyoNightTheme: {
		flag: "tokyo-night-theme",
		value: false,
		excludes: [
			"light-theme",
			"dark-theme",
			"monokai-theme",
			"post-modern-theme",
			"default-theme",
		],
		type: "theme",
	},
	monokaiTheme: {
		flag: "monokai-theme",
		value: false,
		excludes: [
			"light-theme",
			"dark-theme",
			"tokyo-night-theme",
			"post-modern-theme",
			"default-theme",
		],
		type: "theme",
	},
	postModernTheme: {
		flag: "post-modern-theme",
		value: false,
		excludes: [
			"light-theme",
			"dark-theme",
			"tokyo-night-theme",
			"monokai-theme",
			"default-theme",
		],
		type: "theme",
	},
	defaultTheme: {
		flag: "default-theme",
		value: true,
		excludes: [
			"light-theme",
			"dark-theme",
			"tokyo-night-theme",
			"monokai-theme",
			"post-modern-theme",
		],
		type: "theme",
	},
	decimalNumbers: {
		flag: "decimal-numbers",
		value: true,
		excludes: [],
		type: "functionality",
	},
	negativeNumbers: {
		flag: "negative-numbers",
		value: true,
		excludes: [],
		type: "functionality",
	},
};

export const featureFlagsRouter = router({
	get: publicProcedure.query(async () => {
		try {
			const flags = await db.select().from(featureFlags);
			if (flags.length === 0) {
				console.log("no flags found, inserting default flags");
				for (const flag of Object.values(defaultFeatureFlags)) {
					await db.insert(featureFlags).values({
						flag: flag.flag,
						value: flag.value,
						type: flag.type as "theme" | "ui" | "other",
					});
				}
				for (const flag of Object.values(defaultFeatureFlags)) {
					for (const exclude of flag.excludes) {
						await db.insert(featureFlagExcludes).values({
							flag: flag.flag,
							excludedFlag: exclude,
						});
					}
				}
				return await db.select().from(featureFlags);
			}
			return flags;
		} catch (error) {
			console.error("Error fetching feature flags:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch feature flags",
			});
		}
	}),
	update: publicProcedure
		.input(z.object({ flag: z.string(), value: z.boolean() }))
		.mutation(async ({ input }) => {
			try {
				const exists = await db
					.select()
					.from(featureFlags)
					.where(eq(featureFlags.flag, input.flag));
				if (exists.length === 0) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Flag not found",
					});
				}
				if (input.value === true) {
					const excludedFlags = await db
						.select()
						.from(featureFlagExcludes)
						.where(eq(featureFlagExcludes.flag, input.flag));
					for (const excludedFlag of excludedFlags) {
						await db
							.update(featureFlags)
							.set({ value: false })
							.where(eq(featureFlags.flag, excludedFlag.excludedFlag));
					}
				}
				await db
					.update(featureFlags)
					.set({ value: input.value })
					.where(eq(featureFlags.flag, input.flag));
				return { flag: input.flag, value: input.value };
			} catch (error) {
				console.error("Error updating feature flag:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update feature flag",
				});
			}
		}),
});

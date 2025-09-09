import { db } from "@/db";
import { FEATURE_FLAG_TYPES, featureFlags } from "@/db/schema/feature-flags";
import type { FeatureFlagType } from "@/db/schema/feature-flags";
import { publicProcedure, router } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

export const defaultFeatureFlags = {
	chatBox: {
		flag: "chat-box",
		value: true,
		type: "functionality",
		default: true,
	},
	defaultRender: {
		flag: "default-render",
		value: true,
		type: "ui",
		default: true,
	},
	sdui: {
		flag: "sdui",
		value: false,
		type: "ui",
		default: false,
	},
	lightTheme: {
		flag: "light-theme",
		value: false,
		type: "theme",
		default: false,
	},
	darkTheme: {
		flag: "dark-theme",
		value: false,
		type: "theme",
		default: false,
	},
	tokyoNightTheme: {
		flag: "tokyo-night-theme",
		value: false,
		type: "theme",
		default: false,
	},
	monokaiTheme: {
		flag: "monokai-theme",
		value: false,
		type: "theme",
		default: false,
	},
	postModernTheme: {
		flag: "post-modern-theme",
		value: false,
		type: "theme",
		default: false,
	},
	sunsetTheme: {
		flag: "sunset-theme",
		value: false,
		type: "theme",
		default: false,
	},
	defaultTheme: {
		flag: "default-theme",
		value: true,
		type: "theme",
		default: true,
	},
	decimalNumbers: {
		flag: "decimal-numbers",
		value: true,
		type: "functionality",
		default: true,
	},
	negativeNumbers: {
		flag: "negative-numbers",
		value: true,
		type: "functionality",
		default: true,
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
						type: flag.type as FeatureFlagType,
					});
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
				const existingFlag = await db
					.select()
					.from(featureFlags)
					.where(eq(featureFlags.flag, input.flag));

				if (existingFlag.length === 0) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Flag not found",
					});
				}

				const flagType = existingFlag[0].type;

				// Update the flag value
				await db
					.update(featureFlags)
					.set({ value: input.value })
					.where(eq(featureFlags.flag, input.flag));

				// If enabling a flag, disable other flags of the same type (except functionality)
				if (input.value === true) {
					await db
						.update(featureFlags)
						.set({ value: false })
						.where(
							and(
								eq(featureFlags.type, flagType),
								ne(featureFlags.flag, input.flag),
								ne(featureFlags.type, "functionality"),
							),
						);
				}

				// Check if at least one flag per type is enabled for UI and theme types
				if (flagType === "theme" || flagType === "ui") {
					const enabledFlags = await db
						.select()
						.from(featureFlags)
						.where(
							and(
								eq(featureFlags.type, flagType),
								eq(featureFlags.value, true),
							),
						);

					if (enabledFlags.length === 0) {
						const defaultFlag = Object.values(defaultFeatureFlags).find(
							(flag) => flag.type === flagType && flag.default,
						);
						if (!defaultFlag) {
							throw new TRPCError({
								code: "NOT_FOUND",
								message: "Default flag not found",
							});
						}
						await db
							.update(featureFlags)
							.set({ value: true })
							.where(eq(featureFlags.flag, defaultFlag.flag));
					}
				}

				return { flag: input.flag, value: input.value };
			} catch (error) {
				console.error("Error updating feature flag:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update feature flag",
				});
			}
		}),
	create: publicProcedure
		.input(
			z.object({
				flag: z.string().min(1).max(255),
				type: z.enum(FEATURE_FLAG_TYPES),
				value: z.boolean(),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				const existingFlag = await db
					.select()
					.from(featureFlags)
					.where(eq(featureFlags.flag, input.flag));

				if (existingFlag.length === 0) {
					await db.insert(featureFlags).values({
						flag: input.flag,
						type: input.type,
						value: input.value,
					});
				} else {
					await db
						.update(featureFlags)
						.set({ value: input.value })
						.where(eq(featureFlags.flag, input.flag));
				}

				return { flag: input.flag, value: input.value };
			} catch (error) {
				console.error("Error creating feature flag:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create feature flag",
				});
			}
		}),
});

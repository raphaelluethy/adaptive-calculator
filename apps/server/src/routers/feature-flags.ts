import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { featureFlagExcludes, featureFlags } from "@/db/schema/feature-flags";
import { publicProcedure, router } from "@/lib/trpc";

const defaultFeatureFlags = {
	chatBox: {
		flag: "chat-box",
		value: true,
		excludes: [],
	},
	calculator: {
		flag: "calculator",
		value: true,
		excludes: ["calculator-postmodern"],
	},
	calculatorPostmodern: {
		flag: "calculator-postmodern",
		value: false,
		excludes: ["calculator"],
	},
};

export const featureFlagsRouter = router({
	get: publicProcedure.query(async () => {
		const flags = await db.select().from(featureFlags);
		if (flags.length === 0) {
			console.log("no flags found, inserting default flags");
			for (const flag of Object.values(defaultFeatureFlags)) {
				await db.insert(featureFlags).values({
					flag: flag.flag,
					value: flag.value,
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
	}),
	update: publicProcedure
		.input(z.object({ flag: z.string(), value: z.boolean() }))
		.mutation(async ({ input }) => {
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
					await db.update(featureFlags).set({ value: false }).where(eq(featureFlags.flag, excludedFlag.excludedFlag));
				}
			}
			await db.update(featureFlags).set({ value: input.value }).where(eq(featureFlags.flag, input.flag));
			return { flag: input.flag, value: input.value };
		}),
});

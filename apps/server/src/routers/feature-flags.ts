import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { featureFlags } from "@/db/schema/feature-flags";
import { publicProcedure, router } from "@/lib/trpc";

const defaultFeatureFlags = {
	chatBox: {
		flag: "chat-box",
		value: true,
	},
	newCalculatorDesign: {
		flag: "new-calculator-design",
		value: false,
	},
	calculatorPostmodernDesign: {
		flag: "calculator-postmodern-design",
		value: false,
	},
};

export const featureFlagsRouter = router({
	get: publicProcedure.query(async () => {
		const flags = await db.select().from(featureFlags);
		if (flags.length === 0) {
			console.log("no flags found, inserting default flags");
			await db.insert(featureFlags).values(
				Object.values(defaultFeatureFlags).map((flag) => ({
					flag: flag.flag,
					value: flag.value,
				})),
			);
		}
		return flags;
	}),
	update: publicProcedure
		.input(z.object({ flag: z.string(), value: z.boolean() }))
		.mutation(async ({ input }) => {
			const doesFlagExist = await db
				.select()
				.from(featureFlags)
				.where(eq(featureFlags.flag, input.flag));
			if (doesFlagExist.length > 0) {
				await db.update(featureFlags)
					.set({
						value: input.value,
					})
					.where(eq(featureFlags.flag, input.flag));
				console.log("flag updated", input.flag, input.value);
				return {
					flag: input.flag,
					value: input.value,
				};
			} else {
				await db.insert(featureFlags).values({
					flag: input.flag,
					value: input.value,
				});
				console.log("flag inserted", input.flag, input.value);
				return {
					flag: input.flag,
					value: input.value,
				};
			}
		}),
});

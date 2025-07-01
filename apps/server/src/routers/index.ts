import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { calculatorRouter } from "./calculator";
import { aiRouter } from "./ai";
import { featureFlagsRouter } from "./feature-flags";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	calculator: calculatorRouter,
	ai: aiRouter,
	featureFlags: featureFlagsRouter,
});
export type AppRouter = typeof appRouter;

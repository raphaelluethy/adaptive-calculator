import { publicProcedure, router } from "@/lib/trpc";
import { z } from "zod";

let featureFlags: Record<string, boolean> = {
  "chat-box": true,
  "new-calculator-design": false,
};

export const featureFlagsRouter = router({
  get: publicProcedure.query(() => {
    return featureFlags;
  }),
  set: publicProcedure
    .input(z.object({ flag: z.string(), value: z.boolean() }))
    .mutation(({ input }) => {
      featureFlags[input.flag] = input.value;
      return featureFlags;
    }),
});

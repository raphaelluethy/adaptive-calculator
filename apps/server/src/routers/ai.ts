import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { publicProcedure, router } from "@/lib/trpc";

const google = createGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_API_KEY,
});

export const aiRouter = router({
	chat: publicProcedure
		.input(
			z.object({
				messages: z.array(
					z.object({
						role: z.enum(["user", "assistant"]),
						content: z.string(),
					}),
				),
			}),
		)
		.mutation(async ({ input }) => {
			const { messages } = input;

			const result = await generateText({
				model: google("gemini-2.5-flash"),
				messages,
			});

			return result.text;
		}),
});

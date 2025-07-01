import { publicProcedure, router } from "@/lib/trpc";
import { z } from "zod";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

export const aiRouter = router({
    chat: publicProcedure
        .input(z.object({ messages: z.any() }))
        .mutation(async ({ input }) => {
            const { messages } = input;

            const result = await streamText({
                model: google("models/gemini-1.5-flash-latest"),
                messages,
            });

            return result.toDataStreamResponse();
        }),
});

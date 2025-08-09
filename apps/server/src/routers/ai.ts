import { env } from "@/lib/env";
import { publicProcedure, router } from "@/lib/trpc";
import { aiTools } from "@/tools";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { type ModelMessage, generateText, stepCountIs } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_API_KEY || undefined,
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
			try {
				const { messages } = input;
				const toolsCalled: string[] = [];

				// Convert incoming chat messages to ModelMessage format
				const modelMessages: ModelMessage[] = messages.map((m) => ({
					role: m.role,
					content: [{ type: "text", text: m.content }],
				}));

				const result = await generateText({
					model: google("gemini-2.5-flash"),
					messages: modelMessages,
					stopWhen: stepCountIs(3),
					tools: {
						executeShellCommand: aiTools.executeShellCommand,
						updateFeatureFlag: aiTools.updateFeatureFlag,
						executeGemini: aiTools.executeGemini,
					},
					onStepFinish: (step) => {
						for (const toolCall of step.toolCalls) {
							// Record tool usage; support both static and dynamic tools
							toolsCalled.push(toolCall.toolName);
						}
					},
				});

				return { text: result.text, toolsCalled };
			} catch (error) {
				console.error("Error in ai.chat:", error);
				throw error;
			}
		}),
});

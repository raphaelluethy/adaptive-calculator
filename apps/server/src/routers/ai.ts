import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, type ToolExecutionOptions } from "ai";
import { z } from "zod";
import { aiTools } from "@/lib/tools";
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
                    })
                ),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const { messages } = input;
                const toolsCalled: string[] = [];

                const result = await generateText({
                    model: google("gemini-2.5-flash"),
                    messages,
                    maxSteps: 3,
                    tools: {
                        executeShellCommand: {
                            description:
                                aiTools.executeShellCommand.description,
                            parameters: aiTools.executeShellCommand.parameters,
                            execute: async (
                                params: { command: string },
                                context: ToolExecutionOptions
                            ) => {
                                toolsCalled.push("executeShellCommand");
                                return await aiTools.executeShellCommand.execute(
                                    params,
                                    context
                                );
                            },
                        },
                        updateFeatureFlag: {
                            description: aiTools.updateFeatureFlag.description,
                            parameters: aiTools.updateFeatureFlag.parameters,
                            execute: async (
                                params: { flagName: string; enabled: boolean },
                                context: ToolExecutionOptions
                            ) => {
                                toolsCalled.push("updateFeatureFlag");
                                return await aiTools.updateFeatureFlag.execute(
                                    params,
                                    context
                                );
                            },
                        },
                        executeGemini: {
                            description: aiTools.executeGemini.description,
                            parameters: aiTools.executeGemini.parameters,
                            execute: async (
                                params: { command: string },
                                context: ToolExecutionOptions
                            ) => {
                                toolsCalled.push("executeGemini");
                                return await aiTools.executeGemini.execute(
                                    params,
                                    context
                                );
                            },
                        },
                    },
                });

                return {
                    text: result.text,
                    toolsCalled,
                };
            } catch (error) {
                console.error("Error in ai.chat:", error);
                throw error;
            }
        }),
});

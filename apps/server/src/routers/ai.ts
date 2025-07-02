import { exec } from "node:child_process";
import { promisify } from "node:util";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { z } from "zod";
import { publicProcedure, router } from "@/lib/trpc";
import { featureFlagsRouter } from "./feature-flags";

const execAsync = promisify(exec);

const google = createGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_API_KEY,
});

// Helper function to execute shell commands with timing
async function executeShellCommand(command: string) {
	console.log("Executing shell command:", command);
	const startTime = Date.now();

	try {
		const { stdout, stderr } = await execAsync(command);
		const executionTimeMs = Date.now() - startTime;

		const result = {
			output: stdout.trim() || stderr.trim(),
			executionTimeMs,
			exitCode: 0,
		};
		console.log("Shell command result:", result);
		return result;
	} catch (error: any) {
		const executionTimeMs = Date.now() - startTime;

		const errorResult = {
			output: error.stdout || "",
			executionTimeMs,
			exitCode: error.code || 1,
			error: error.stderr || error.message,
		};
		console.log("Shell command result:", errorResult);
		return errorResult;
	}
}



// Helper function to update feature flags directly using the router
async function updateFeatureFlag(flagName: string, enabled: boolean) {
	const startTime = Date.now();

	try {
		// Create a caller for the feature flags router
		const caller = featureFlagsRouter.createCaller({ session: null });

		const result = await caller.update({
			flag: flagName,
			value: enabled,
		});

		const executionTimeMs = Date.now() - startTime;

		return {
			data: result,
			executionTimeMs,
			success: true,
		};
	} catch (error: any) {
		const executionTimeMs = Date.now() - startTime;
		return {
			error: error.message,
			executionTimeMs,
			success: false,
		};
	}
}

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

				const result = await generateText({
					model: google("gemini-2.5-flash"),
					messages,
					maxSteps: 10,
					tools: {
						executeShellCommand: tool({
							description:
								"Execute any shell command and return output, execution time, and exit code. If the command fails, return the error message. If the command succeeds, return the output, execution time, and exit code.",
							parameters: z.object({
								command: z.string().describe("The shell command to execute"),
							}),
							execute: async ({ command }) => {
								toolsCalled.push("executeShellCommand");
								const result = await executeShellCommand(command);
								return {
									command,
									output: result.output,
									executionTimeMs: result.executionTimeMs,
									exitCode: result.exitCode,
								};
							},
						}),

						updateFeatureFlag: tool({
							description:
								"Update feature flags in the calculator application",
							parameters: z.object({
								flagName: z
									.string()
									.describe("The name of the feature flag to update"),
								enabled: z
									.boolean()
									.describe("Whether the feature flag should be enabled or disabled"),
							}),
							execute: async ({
								flagName,
								enabled,
							}) => {
								toolsCalled.push("updateFeatureFlag");
								const result = await updateFeatureFlag(
									flagName,
									enabled,
								);
								return {
									flagName,
									enabled,
									success: result.success,
									executionTimeMs: result.executionTimeMs,
									data: result.data,
									error: result.error,
								};
							},
						}),
					},
				});

				return {
					text: result.text,
					toolsCalled,
				}
			} catch (error) {
				console.error("Error in ai.chat:", error);
				throw error;
			}
		}),
});

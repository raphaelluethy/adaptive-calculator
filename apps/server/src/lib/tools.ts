import { exec } from "node:child_process";
import { promisify } from "node:util";
import { tool } from "ai";
import { z } from "zod";
import {
    defaultFeatureFlags,
    featureFlagsRouter,
} from "@/routers/feature-flags";

const execAsync = promisify(exec);
const featureFlagKeys = Object.values(defaultFeatureFlags).map(
    (flagObj) => flagObj.flag
);

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

export const aiTools = {
    executeShellCommand: tool({
        description:
            "Execute any shell command and return output, execution time, and exit code. If the command fails, return the error message. If the command succeeds, return the output, execution time, and exit code.",
        parameters: z.object({
            command: z.string().describe("The shell command to execute"),
        }),
        execute: async ({ command }) => {
            const result = await executeShellCommand(command);
            return {
                command,
                output: result.output,
                executionTimeMs: result.executionTimeMs,
                exitCode: result.exitCode,
            };
        },
    }),

    executeGemini: tool({
        description:
            "Execute the Gemini CLI to perform coding changes directly",
        parameters: z.object({
            command: z
                .string()
                .describe(
                    "The query for the changes that gemini should apply. Do not add any flags to the command, only a plain string that describes the changes."
                ),
        }),
        execute: async ({ command }) => {
            const result = await executeShellCommand(
                `gemini -y -p "${command}"`
            );
            return {
                command,
                output: result.output,
                executionTimeMs: result.executionTimeMs,
                exitCode: result.exitCode,
            };
        },
    }),

    updateFeatureFlag: tool({
        description: "Update feature flags in the calculator application",
        parameters: z.object({
            flagName: z
                .string()
                .describe(
                    `The name of the feature flag to update, you have the following options: ${featureFlagKeys.join(
                        ", "
                    )}. If the user does not specifically provide the exact flag name, the tool will try to match it with the available options, e.g. "chat-box" could match "chatBox or chat box". If you match the flag name, tell so when responding.`
                ),
            enabled: z
                .boolean()
                .describe(
                    "Whether the feature flag should be enabled or disabled"
                ),
        }),
        execute: async ({ flagName, enabled }) => {
            const result = await updateFeatureFlag(flagName, enabled);
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
};

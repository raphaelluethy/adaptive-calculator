import { defaultFeatureFlags } from "@/routers/feature-flags";
import { tool } from "ai";
import { z } from "zod";
import { executeShellCommand } from "./exec";
import { updateFeatureFlag } from "./feature-flags";
import { executeGemini } from "./gemini";

const featureFlagKeys = Object.values(defaultFeatureFlags).map((f) => f.flag);

export const aiTools = {
    executeShellCommand: tool({
        description:
            "Execute any shell command and return output, execution time, and exit code. If the command fails, return the error message.",
        inputSchema: z.object({
            command: z.string().describe("The shell command to execute"),
        }),
        execute: async ({ command }) => {
            const result = await executeShellCommand(command);
            return {
                command,
                output: result.output,
                executionTimeMs: result.executionTimeMs,
                exitCode: result.exitCode,
                ...("error" in result ? { error: result.error } : {}),
            };
        },
    }),

    executeGemini: tool({
        description:
            "Execute the Gemini CLI in a tmux session for monitoring, wait for completion, and return the full output",
        inputSchema: z.object({
            command: z
                .string()
                .describe(
                    "The query for the changes that gemini should apply. Do not add any flags to the command, only a plain string that describes the changes.",
                ),
            timeout: z
                .number()
                .optional()
                .default(600000)
                .describe("Maximum time to wait for gemini to complete in milliseconds"),
        }),
        execute: async ({ command, timeout }) => {
            const result = await executeGemini(command, timeout);
            return result;
        },
    }),

    checkGeminiSession: tool({
        description: "Check the live status of a running Gemini tmux session",
        inputSchema: z.object({
            sessionName: z.string().describe("The tmux session name to check"),
        }),
        execute: async ({ sessionName }) => {
            // Reuse exec to get status without re-implementing parsing
            const list = await executeShellCommand(
                `tmux list-sessions | grep "^${sessionName}:" || echo "Session not found"`,
            );
            if (list.output.includes("Session not found")) {
                return { sessionName, exists: false, status: "Session not found or has ended" };
            }
            const capture = await executeShellCommand(
                `tmux capture-pane -t "${sessionName}" -p | tail -50`,
            );
            return {
                sessionName,
                exists: true,
                status: list.output,
                recentOutput: capture.output,
                attachCommand: `tmux attach-session -t ${sessionName}`,
            };
        },
    }),

    updateFeatureFlag: tool({
        description: "Update feature flags in the calculator application",
        inputSchema: z.object({
            flagName: z
                .string()
                .describe(
                    `The name of the feature flag to update, you have the following options: ${featureFlagKeys.join(
                        ", ",
                    )}. If the user does not specifically provide the exact flag name, the tool will try to match it with the available options, e.g. "chat-box" could match "chatBox or chat box". If you match the flag name, tell so when responding.`,
                ),
            enabled: z.boolean().describe("Whether the feature flag should be enabled or disabled"),
        }),
        execute: async ({ flagName, enabled }) => {
            const result = await updateFeatureFlag(flagName, enabled);
            return result;
        },
    }),
};

export type AiTools = typeof aiTools;



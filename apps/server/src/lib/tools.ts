import { exec } from "node:child_process";
import { promisify } from "node:util";
import { tool } from "ai";
import { z } from "zod";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
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

// Helper function to wait for tmux session to complete
async function waitForTmuxSession(
    sessionName: string,
    checkInterval: number = 2000
): Promise<boolean> {
    while (true) {
        try {
            const { stdout } = await execAsync(
                `tmux list-sessions | grep "^${sessionName}:" || echo "NOT_FOUND"`
            );
            if (stdout.trim() === "NOT_FOUND") {
                return true; // Session has ended
            }
            await new Promise((resolve) => setTimeout(resolve, checkInterval));
        } catch {
            return true; // Session has ended
        }
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
            "Execute the Gemini CLI in a tmux session for monitoring, wait for completion, and return the full output",
        parameters: z.object({
            command: z
                .string()
                .describe(
                    "The query for the changes that gemini should apply. Do not add any flags to the command, only a plain string that describes the changes."
                ),
            timeout: z
                .number()
                .optional()
                .default(600000) // 10 minutes default
                .describe(
                    "Maximum time to wait for gemini to complete in milliseconds"
                ),
        }),
        execute: async ({ command, timeout }) => {
            const startTime = Date.now();

            // Check environment variable for persistence setting, default to true
            const persistence = process.env.TMUX_PERSIST !== "false";

            // Generate unique session name and file paths
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const sessionName = `gemini-${timestamp}`;
            const tmpDir = os.tmpdir();
            const outputFile = path.join(tmpDir, `${sessionName}-output.log`);
            const exitCodeFile = path.join(
                tmpDir,
                `${sessionName}-exitcode.log`
            );

            // Determine the actual working directory
            // Default to 2 levels up from server directory (calculator root)
            let actualWorkingDir = path.resolve(process.cwd(), "../..");

            // Create the gemini command with output redirection
            const geminiCommand = `gemini -y -p "${command.replace(
                /"/g,
                '\\"'
            )}. Do not run any shell commands like pnpm dev, pnpm build, or pnpm start. Just apply the changes to the codebase."`;

            // Create a wrapper script that captures output and exit code
            const wrapperScript = `
#!/bin/bash
cd "${actualWorkingDir}"
echo "Working directory: $(pwd)"
{
    ${geminiCommand} 2>&1 | tee "${outputFile}"
    echo $? > "${exitCodeFile}"
} || {
    echo $? > "${exitCodeFile}"
}
echo "\\nGemini finished with exit code: $(cat "${exitCodeFile}")"
${
    persistence
        ? 'echo "Session is persistent and will remain alive. Press Ctrl+C to close this session..."'
        : 'echo "Session will close automatically..."'
}
${persistence ? "sleep infinity" : 'exit $(cat "${exitCodeFile}")'}
            `;

            // Write wrapper script to temp file
            const scriptFile = path.join(tmpDir, `${sessionName}-script.sh`);
            await fs.writeFile(scriptFile, wrapperScript, { mode: 0o755 });

            // Create tmux session running the wrapper script in the specified directory
            const tmuxCommand = `tmux new-session -d -s "${sessionName}" -c "${actualWorkingDir}" "bash ${scriptFile}"`;

            try {
                await execAsync(tmuxCommand);

                console.log(`Gemini started in tmux session: ${sessionName}`);
                console.log(
                    `To monitor: tmux attach-session -t ${sessionName}`
                );

                // Wait for the session to complete or timeout
                const checkInterval = 2000; // Check every 2 seconds
                const maxChecks = Math.floor(timeout / checkInterval);
                let completed = false;

                for (let i = 0; i < maxChecks; i++) {
                    // Check if exit code file exists (indicates completion)
                    try {
                        await fs.access(exitCodeFile);
                        completed = true;
                        break;
                    } catch {
                        // File doesn't exist yet, continue waiting
                    }

                    // Also check if session still exists
                    const sessionExists = await executeShellCommand(
                        `tmux list-sessions | grep "^${sessionName}:" || echo "NOT_FOUND"`
                    );

                    if (sessionExists.output.trim() === "NOT_FOUND") {
                        // Session ended unexpectedly
                        break;
                    }

                    await new Promise((resolve) =>
                        setTimeout(resolve, checkInterval)
                    );
                }

                // Read the output and exit code
                let output = "";
                let exitCode = 1;

                try {
                    output = await fs.readFile(outputFile, "utf-8");
                } catch (error) {
                    output = "Failed to read output file";
                }

                try {
                    const exitCodeStr = await fs.readFile(
                        exitCodeFile,
                        "utf-8"
                    );
                    exitCode = parseInt(exitCodeStr.trim(), 10);
                } catch (error) {
                    exitCode = completed ? 0 : -1;
                }

                // Clean up temporary files
                try {
                    await fs.unlink(outputFile);
                    await fs.unlink(exitCodeFile);
                    await fs.unlink(scriptFile);
                } catch {
                    // Ignore cleanup errors
                }

                // Kill the tmux session if it's still running (unless persistence is enabled)
                if (!persistence) {
                    try {
                        await execAsync(
                            `tmux kill-session -t "${sessionName}"`
                        );
                    } catch {
                        console.error(
                            `Error killing tmux session: ${sessionName}. It might have already ended.`
                        );
                    }
                }

                const executionTimeMs = Date.now() - startTime;

                if (!completed && executionTimeMs >= timeout) {
                    return {
                        command,
                        output: output || "Command timed out",
                        executionTimeMs,
                        exitCode: -1,
                        error: `Gemini execution timed out after ${timeout}ms`,
                        sessionName,
                        workingDirectory: actualWorkingDir,
                        persistent: persistence,
                    };
                }

                return {
                    command,
                    output,
                    executionTimeMs,
                    exitCode,
                    sessionName,
                    completed: true,
                    workingDirectory: actualWorkingDir,
                    persistent: persistence,
                    ...(persistence && {
                        attachCommand: `tmux attach-session -t ${sessionName}`,
                    }),
                };
            } catch (error: any) {
                const executionTimeMs = Date.now() - startTime;

                // Try to clean up
                try {
                    await fs.unlink(outputFile);
                    await fs.unlink(exitCodeFile);
                    await fs.unlink(scriptFile);
                    if (!persistence) {
                        await execAsync(
                            `tmux kill-session -t "${sessionName}"`
                        );
                    }
                } catch {
                    // Ignore cleanup errors
                }

                return {
                    command,
                    output: "",
                    error: error.message,
                    executionTimeMs,
                    exitCode: error.code || 1,
                    sessionName,
                    workingDirectory: actualWorkingDir,
                };
            }
        },
    }),

    checkGeminiSession: tool({
        description: "Check the live status of a running Gemini tmux session",
        parameters: z.object({
            sessionName: z.string().describe("The tmux session name to check"),
        }),
        execute: async ({ sessionName }) => {
            try {
                // Check if session exists
                const listResult = await executeShellCommand(
                    `tmux list-sessions | grep "^${sessionName}:" || echo "Session not found"`
                );

                if (listResult.output.includes("Session not found")) {
                    return {
                        sessionName,
                        exists: false,
                        status: "Session not found or has ended",
                    };
                }

                // Get the last few lines of output from the session
                const captureResult = await executeShellCommand(
                    `tmux capture-pane -t "${sessionName}" -p | tail -50`
                );

                return {
                    sessionName,
                    exists: true,
                    status: listResult.output,
                    recentOutput: captureResult.output,
                    attachCommand: `tmux attach-session -t ${sessionName}`,
                };
            } catch (error: any) {
                return {
                    sessionName,
                    exists: false,
                    error: error.message,
                };
            }
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

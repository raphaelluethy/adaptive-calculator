import { exec } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { promisify } from "node:util";
import { env } from "@/lib/env";
import { executeShellCommand } from "./exec";
import type { GeminiRunResult } from "./types";

const execAsync = promisify(exec);

export async function executeGemini(
	command: string,
	timeout = 600_000,
): Promise<GeminiRunResult> {
	const startTime = Date.now();

	const persistence = env.TMUX_PERSIST !== "false";
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const sessionName = `gemini-${timestamp}`;
	const tmpDir = os.tmpdir();
	const outputFile = path.join(tmpDir, `${sessionName}-output.log`);
	const exitCodeFile = path.join(tmpDir, `${sessionName}-exitcode.log`);

	const actualWorkingDir = path.resolve(process.cwd(), "../..");
	const geminiCommand = `gemini -y -p "${command.replace(/"/g, '\\"')}. Do not run any shell commands like pnpm dev, pnpm build, or pnpm start. Just apply the changes to the codebase."`;

	const wrapperScript = `#!/bin/bash
cd "${actualWorkingDir}"
echo "Working directory: $(pwd)"
{
    ${geminiCommand} 2>&1 | tee "${outputFile}"
    echo $? > "${exitCodeFile}"
} || {
    echo $? > "${exitCodeFile}"
}
echo "\nGemini finished with exit code: $(cat "${exitCodeFile}")"
if [ "${persistence}" = "true" ]; then
    echo "Session is persistent and will remain alive. Press Ctrl+C to close this session..."
    while true; do
        sleep 3600
    done
else
    echo "Session will close automatically..."
    exit $(cat "${exitCodeFile}")
fi
`;

	const scriptFile = path.join(tmpDir, `${sessionName}-script.sh`);
	await fs.writeFile(scriptFile, wrapperScript, { mode: 0o755 });

	const tmuxCommand = `tmux new-session -d -s "${sessionName}" -c "${actualWorkingDir}" "bash ${scriptFile}"`;

	try {
		await execAsync(tmuxCommand);

		const checkInterval = 2000;
		const maxChecks = Math.floor(timeout / checkInterval);
		let completed = false;

		for (let i = 0; i < maxChecks; i++) {
			try {
				await fs.access(exitCodeFile);
				completed = true;
				break;
			} catch {}

			const sessionExists = await executeShellCommand(
				`tmux list-sessions | grep "^${sessionName}:" || echo "NOT_FOUND"`,
			);
			if (sessionExists.output.trim() === "NOT_FOUND") {
				break;
			}
			await new Promise((resolve) => setTimeout(resolve, checkInterval));
		}

		let output = "";
		let exitCode = 1;
		try {
			output = await fs.readFile(outputFile, "utf-8");
		} catch {
			output = "Failed to read output file";
		}
		try {
			const exitCodeStr = await fs.readFile(exitCodeFile, "utf-8");
			exitCode = Number.parseInt(exitCodeStr.trim(), 10);
		} catch {
			exitCode = completed ? 0 : -1;
		}

		try {
			await fs.unlink(outputFile);
			await fs.unlink(exitCodeFile);
			await fs.unlink(scriptFile);
		} catch {}

		if (!persistence) {
			try {
				await execAsync(`tmux kill-session -t "${sessionName}"`);
			} catch {
				// ignore
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
	} catch (error: unknown) {
		const executionTimeMs = Date.now() - startTime;
		try {
			await fs.unlink(outputFile);
			await fs.unlink(exitCodeFile);
			await fs.unlink(scriptFile);
			if (!persistence) {
				await execAsync(`tmux kill-session -t "${sessionName}"`);
			}
		} catch {}

		return {
			command,
			output: "",
			error: (error as Error).message,
			executionTimeMs,
			exitCode: (error as { code?: number }).code ?? 1,
			sessionName,
			workingDirectory: actualWorkingDir,
			persistent: persistence,
		};
	}
}

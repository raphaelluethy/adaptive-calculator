import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { ExecError, ShellCommandResult } from "./types";

const execAsync = promisify(exec);

export async function executeShellCommand(
	command: string,
): Promise<ShellCommandResult> {
	const startTime = Date.now();
	try {
		const { stdout, stderr } = await execAsync(command);
		return {
			output: (stdout ?? "").trim() || (stderr ?? "").trim(),
			executionTimeMs: Date.now() - startTime,
			exitCode: 0,
		};
	} catch (error: unknown) {
		const e = error as ExecError;
		return {
			output: (e.stdout ?? "").toString(),
			executionTimeMs: Date.now() - startTime,
			exitCode: e.code ?? 1,
			error: (e.stderr ?? e.message ?? "Unknown error").toString(),
		};
	}
}

export type ExecError = Error & {
	code?: number;
	stdout?: string;
	stderr?: string;
};

export interface ShellCommandSuccess {
	output: string;
	executionTimeMs: number;
	exitCode: number;
}

export interface ShellCommandFailure extends ShellCommandSuccess {
	error: string;
}

export type ShellCommandResult = ShellCommandSuccess | ShellCommandFailure;

export interface GeminiRunResultBase {
	command: string;
	output: string;
	executionTimeMs: number;
	exitCode: number;
	sessionName: string;
	workingDirectory: string;
	persistent: boolean;
}

export interface GeminiRunCompleted extends GeminiRunResultBase {
	completed: true;
	attachCommand?: string;
}

export interface GeminiRunTimedOut extends GeminiRunResultBase {
	error: string;
}

export type GeminiRunResult = GeminiRunCompleted | GeminiRunTimedOut;

export interface UpdateFeatureFlagResultSuccess {
	flagName: string;
	enabled: boolean;
	success: true;
	executionTimeMs: number;
	data: { flag: string; value: boolean };
}

export interface UpdateFeatureFlagResultFailure {
	flagName: string;
	enabled: boolean;
	success: false;
	executionTimeMs: number;
	error: string;
}

export type UpdateFeatureFlagResult =
	| UpdateFeatureFlagResultSuccess
	| UpdateFeatureFlagResultFailure;

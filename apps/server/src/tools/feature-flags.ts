import type { FeatureFlagType } from "@/db/schema/feature-flags";
import { featureFlagsRouter } from "@/routers/feature-flags";
import type { UpdateFeatureFlagResult } from "./types";

export async function updateFeatureFlag(
	flagName: string,
	enabled: boolean,
): Promise<UpdateFeatureFlagResult> {
	const startTime = Date.now();
	try {
		const caller = featureFlagsRouter.createCaller({ session: null });
		const result = await caller.update({ flag: flagName, value: enabled });
		return {
			flagName,
			enabled,
			success: true,
			executionTimeMs: Date.now() - startTime,
			data: result,
		};
	} catch (error: unknown) {
		return {
			flagName,
			enabled,
			success: false,
			executionTimeMs: Date.now() - startTime,
			error: (error as Error).message,
		};
	}
}

export async function createFeatureFlag(
	flagName: string,
	enabled: boolean,
	type: FeatureFlagType,
): Promise<{ flag: string; value: boolean }> {
	try {
		const caller = featureFlagsRouter.createCaller({ session: null });
		const result = await caller.create({
			flag: flagName,
			value: enabled,
			type,
		});
		const updatedFlag = await caller.update({ flag: flagName, value: enabled });
		return updatedFlag;
	} catch (error: unknown) {
		throw new Error((error as Error).message);
	}
}

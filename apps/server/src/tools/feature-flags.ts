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



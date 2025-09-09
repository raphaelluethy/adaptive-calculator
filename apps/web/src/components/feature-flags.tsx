import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function FeatureFlags() {
	const queryClient = useQueryClient();

	const flagsQuery = useQuery(trpc.featureFlags.get.queryOptions());

	const updateFlagMutation = useMutation(
		trpc.featureFlags.update.mutationOptions({
			onSuccess: () => {
				console.log("Feature flag updated");
				queryClient.invalidateQueries({
					queryKey: trpc.featureFlags.get.queryKey(),
				});
				toast.success("Feature flag updated");
			},
			onError: (error) => {
				console.error("Error updating feature flag:", error);
				toast.error("Failed to update feature flag");
			},
		}),
	);

	const handleFlagUpdate = (flag: string, value: boolean) => {
		updateFlagMutation.mutate({ flag, value: !value });
	};

	return (
		<div className="h-full overflow-y-auto">
			{flagsQuery.data && (
				<div className="space-y-2">
					{flagsQuery.data.map((flag) => (
						<div
							key={flag.flag}
							className="flex justify-between items-center p-2 border rounded"
						>
							<span className="text-sm font-medium">{flag.flag}</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleFlagUpdate(flag.flag, flag.value)}
							>
								{flag.value ? "Disable" : "Enable"}
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

export function FeatureFlags() {
  const queryClient = useQueryClient();

  const flagsQuery = useQuery(trpc.featureFlags.get.queryOptions());

  const setFlag = useMutation(trpc.featureFlags.set.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.featureFlags.get.queryKey() });
    },
  }));

  return (
    <div className="h-full overflow-y-auto">
      {flagsQuery.data && (
        <div className="space-y-2">
          {Object.entries(flagsQuery.data).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between items-center p-2 border rounded"
            >
              <span className="text-sm font-medium">{key}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlag.mutate({ flag: key, value: !value })}
              >
                {value ? "Disable" : "Enable"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

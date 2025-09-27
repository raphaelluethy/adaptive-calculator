import type { MousePosition } from "@/types/analytics";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

export function useAnalyticsData() {
	const { data: mousePositions, isLoading: mouseLoading } = useQuery(
		trpc.logs.getMousePositions.queryOptions(),
	);
	const { data: clickEvents, isLoading: clickLoading } = useQuery(
		trpc.logs.getClickEvents.queryOptions(),
	);

	// Sort mouse positions by timestamp to ensure proper line connections
	const sortedMousePositions =
		mousePositions
			?.slice()
			.sort(
				(a: MousePosition, b: MousePosition) =>
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
			) || [];

	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleString();
	};

	// Log data when not loading for debugging
	if (!mouseLoading && !clickLoading) {
		console.log({
			mousePositions: sortedMousePositions,
			clickEvents: clickEvents || [],
		});
	}

	return {
		mousePositions: sortedMousePositions,
		clickEvents: clickEvents || [],
		mouseLoading,
		clickLoading,
		formatTimestamp,
	};
}

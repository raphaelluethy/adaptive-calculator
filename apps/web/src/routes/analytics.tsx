import { ClickEventsTable, MousePositionChart } from "@/components/analytics";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analytics")({
	component: Analytics,
});

function Analytics() {
	const {
		mousePositions,
		clickEvents,
		mouseLoading,
		clickLoading,
		formatTimestamp,
	} = useAnalyticsData();

	return (
		<div className="container mx-auto p-6 space-y-6">
			<h1 className="text-3xl font-bold">Analytics Dashboard</h1>

			<MousePositionChart
				mousePositions={mousePositions}
				isLoading={mouseLoading}
				formatTimestamp={formatTimestamp}
			/>

			<ClickEventsTable
				clickEvents={clickEvents}
				isLoading={clickLoading}
				formatTimestamp={formatTimestamp}
			/>
		</div>
	);
}

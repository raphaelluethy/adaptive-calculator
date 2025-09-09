import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { nanoid } from "nanoid";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface MousePosition {
	timestamp: string;
	x: number;
	y: number;
}

interface ClickEvent {
	id: string | number;
	timestamp: string;
	page?: string;
	x?: number;
	y?: number;
}

interface TooltipProps {
	active?: boolean;
	payload?: Array<{
		payload: MousePosition;
	}>;
	label?: string;
}

export const Route = createFileRoute("/analytics")({
	component: Analytics,
});

function Analytics() {
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
	if (!mouseLoading && !clickLoading) {
		console.log({
			mousePositions: sortedMousePositions,
			clickEvents: clickEvents || [],
		});
	}

	const CustomTooltip = ({ active, payload }: TooltipProps) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg text-gray-900 dark:text-gray-100">
					<p className="font-medium">{`Time: ${formatTimestamp(data.timestamp)}`}</p>
					<p className="text-blue-600 dark:text-blue-400">{`X: ${(data.x * 100).toFixed(1)}%`}</p>
					<p className="text-red-600 dark:text-red-400">{`Y: ${(data.y * 100).toFixed(1)}%`}</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<h1 className="text-3xl font-bold">Analytics Dashboard</h1>

			<Card>
				<CardHeader>
					<CardTitle>Mouse Position Path</CardTitle>
				</CardHeader>
				<CardContent>
					{mouseLoading ? (
						<Skeleton className="w-full" style={{ aspectRatio: "16/9" }} />
					) : (
						<div style={{ width: "100%", aspectRatio: "16/9" }}>
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={sortedMousePositions}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										type="number"
										dataKey="x"
										domain={[0, 1]}
										tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
										label={{
											value: "X Position (%)",
											position: "insideBottom",
											offset: -10,
										}}
									/>
									<YAxis
										type="number"
										dataKey="y"
										domain={[0, 1]}
										tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
										label={{
											value: "Y Position (%)",
											angle: -90,
											position: "insideLeft",
										}}
									/>
									<Tooltip content={<CustomTooltip />} />
									<Line
										type="linear"
										dataKey="y"
										stroke="#8884d8"
										strokeWidth={2}
										dot={{ fill: "#8884d8", strokeWidth: 2, r: 3 }}
										connectNulls={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Click Events</CardTitle>
				</CardHeader>
				<CardContent>
					{clickLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 5 }, () => (
								<Skeleton key={nanoid()} className="h-12 w-full" />
							))}
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
								<thead>
									<tr className="bg-gray-50 dark:bg-gray-800">
										<th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-gray-100">
											Timestamp
										</th>
										<th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-gray-100">
											Page
										</th>
										<th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-gray-100">
											X Position
										</th>
										<th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-gray-100">
											Y Position
										</th>
									</tr>
								</thead>
								<tbody>
									{clickEvents?.map((event: ClickEvent) => (
										<tr
											key={event.id}
											className="hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
										>
											<td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
												{formatTimestamp(event.timestamp)}
											</td>
											<td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
												{event.page || "N/A"}
											</td>
											<td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
												{typeof event.x === "number"
													? (event.x * 100).toFixed(1) + "%"
													: "N/A"}
											</td>
											<td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
												{typeof event.y === "number"
													? (event.y * 100).toFixed(1) + "%"
													: "N/A"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{clickEvents?.length === 0 && (
								<p className="text-center text-gray-500 py-4">
									No click events recorded yet.
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

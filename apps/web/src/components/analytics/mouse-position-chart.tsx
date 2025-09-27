import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MousePosition, TooltipProps } from "@/types/analytics";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface MousePositionChartProps {
	mousePositions: MousePosition[];
	isLoading: boolean;
	formatTimestamp: (timestamp: string) => string;
}

function CustomTooltip({ active, payload }: TooltipProps) {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg text-gray-900 dark:text-gray-100">
				<p className="font-medium">{`Time: ${new Date(data.timestamp).toLocaleString()}`}</p>
				<p className="text-blue-600 dark:text-blue-400">{`X: ${(data.x * 100).toFixed(1)}%`}</p>
				<p className="text-red-600 dark:text-red-400">{`Y: ${(data.y * 100).toFixed(1)}%`}</p>
			</div>
		);
	}
	return null;
}

export default function MousePositionChart({
	mousePositions,
	isLoading,
	formatTimestamp,
}: MousePositionChartProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Mouse Position Path</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Skeleton className="w-full" style={{ aspectRatio: "16/9" }} />
				) : (
					<div style={{ width: "100%", aspectRatio: "16/9" }}>
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={mousePositions}>
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
	);
}

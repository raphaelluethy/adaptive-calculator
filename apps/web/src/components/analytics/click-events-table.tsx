import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClickEvent } from "@/types/analytics";
import { nanoid } from "nanoid";

interface ClickEventsTableProps {
	clickEvents: ClickEvent[];
	isLoading: boolean;
	formatTimestamp: (timestamp: string) => string;
}

export default function ClickEventsTable({
	clickEvents,
	isLoading,
	formatTimestamp,
}: ClickEventsTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Click Events</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
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
								{clickEvents.map((event: ClickEvent) => (
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
												? `${(event.x * 100).toFixed(1)}%`
												: "N/A"}
										</td>
										<td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
											{typeof event.y === "number"
												? `${(event.y * 100).toFixed(1)}%`
												: "N/A"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{clickEvents.length === 0 && (
							<p className="text-center text-gray-500 py-4">
								No click events recorded yet.
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

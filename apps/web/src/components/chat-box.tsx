import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";

export function ChatBox() {
	const flagsQuery = useQuery(trpc.featureFlags.get.queryOptions());

	const apiEndpoint = useMemo(() => {
		const base = (import.meta as any).env?.VITE_SERVER_URL ?? "http://localhost:3000";
		return `${base}/api/chat` as string;
	}, []);

	const { messages, sendMessage, setMessages } = useChat({
		transport: new DefaultChatTransport({ api: apiEndpoint }),
	});

	const [input, setInput] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;
	sendMessage({ text: input });
		setInput("");
	};

	// When the updateFeatureFlag tool finishes, refresh feature flags
	const processedToolResultsRef = useRef<Set<string>>(new Set());
	useEffect(() => {
		for (const m of messages as any[]) {
			for (const part of (m.parts ?? []) as any[]) {
				if (
					typeof part.type === "string" &&
					part.type === "tool-updateFeatureFlag" &&
					part.state === "output-available" &&
					!processedToolResultsRef.current.has(part.toolCallId)
				) {
					processedToolResultsRef.current.add(part.toolCallId);
					flagsQuery.refetch();
					// Append a clear assistant message summarizing the change
					const output = part.output as {
						flagName: string;
						enabled: boolean;
						success: boolean;
						data?: { flag: string; value: boolean };
						error?: string;
					};
					const finalFlag = output?.data?.flag ?? output?.flagName;
					const finalValue = output?.data?.value ?? output?.enabled;
					const summary = output?.success
						? `Change applied: feature flag "${finalFlag}" set to ${finalValue ? "enabled" : "disabled"}.`
						: `Change failed: could not update feature flag "${finalFlag}" (${output?.error ?? "unknown error"}).`;
					setMessages((prev: any[]) => [
						...prev,
						{
							id: `change-${String(part.toolCallId ?? Date.now())}`,
							role: "assistant",
							parts: [{ type: "text", text: summary }],
						},
					]);
				}
			}
		}
	}, [messages, flagsQuery]);

	const isChatBoxEnabled = flagsQuery.data?.find(
		(flag) => flag.flag === "chat-box",
	)?.value;

	if (!isChatBoxEnabled) {
		return <div>Chat box is disabled</div>;
	}

	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 overflow-y-auto mb-4 space-y-2">
				{(messages as any[]).map((m) => (
					<div key={m.id} className="text-sm">
						<div
							className={`p-2 rounded ${
								m.role === "user"
									? "bg-blue-100 dark:bg-blue-900 ml-4"
									: "bg-gray-100 dark:bg-gray-800 mr-4"
							}`}
						>
							<strong className="text-xs text-gray-700 dark:text-gray-300">
								{m.role === "user" ? "You" : "AI"}:
							</strong>
							<div className="mt-1 text-gray-800 dark:text-gray-100 space-y-1">
							{((m as any).parts ?? []).map((part: any, idx: number) => {
									if (part.type === "text") {
										return <div key={idx}>{part.text}</div>;
									}
									if (typeof part.type === "string" && part.type.startsWith("tool-")) {
										const toolName = part.type.replace(/^tool-/, "");
										const callId = part.toolCallId as string | undefined;
										switch (part.state) {
											case "input-streaming":
												return (
													<div key={idx} className="text-xs text-gray-600">
														Calling {toolName}…
													</div>
												);
											case "input-available":
												return (
													<div key={idx} className="text-xs text-gray-600">
														{toolName} args: {JSON.stringify(part.input)}
													</div>
												);
											case "output-available":
												return (
													<div key={idx} className="text-xs text-gray-600">
														{toolName} result: {JSON.stringify(part.output)}
														{callId ? ` (id: ${callId})` : null}
													</div>
												);
											case "output-error":
												return (
													<div key={idx} className="text-xs text-red-600">
														{toolName} error: {String(part.errorText ?? "Unknown error")}
													</div>
												);
										}
									}
									return null;
								})}
							</div>
						</div>
					</div>
				))}
				{false && (
					<div className="text-sm">
						<div className="p-2 rounded bg-gray-100 dark:bg-gray-800 mr-4">
							<strong className="text-xs text-gray-700 dark:text-gray-300">
								AI:
							</strong>
							<div className="mt-1 text-gray-800 dark:text-gray-100">Thinking...</div>
						</div>
					</div>
				)}
			</div>

			<form onSubmit={handleSubmit} className="flex gap-2">
				<Input
					value={input}
					placeholder="Say something..."
					onChange={(e) => setInput(e.target.value)}
					className="flex-1"
				/>
				<Button type="submit" size="sm" disabled={!input.trim()}>
					Send
				</Button>
			</form>
		</div>
	);
}

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";

interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
}

export function ChatBox() {
	const flagsQuery = useQuery(trpc.featureFlags.get.queryOptions());

	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");

	const chatMutation = useMutation(
		trpc.ai.chat.mutationOptions({
			onSuccess: (response: string) => {
				setMessages((prev) => [
					...prev,
					{
						id: `${Date.now().toString()}-ai`,
						role: "assistant",
						content: response,
					},
				]);
			},
		}),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		// Add user message to chat
		const userMessage: ChatMessage = {
			id: `${Date.now().toString()}-user`,
			role: "user",
			content: input,
		};
		setMessages((prev) => [...prev, userMessage]);

		// Convert messages to the format expected by the AI SDK
		const aiMessages = [...messages, userMessage].map((msg) => ({
			role: msg.role,
			content: msg.content,
		}));

		// Send to AI
		chatMutation.mutate({ messages: aiMessages });

		// Clear input
		setInput("");
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	};

	const isChatBoxEnabled = flagsQuery.data?.find(
		(flag) => flag.flag === "chat-box",
	)?.value;

	if (!isChatBoxEnabled) {
		return <div>Chat box is disabled</div>;
	}

	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 overflow-y-auto mb-4 space-y-2">
				{messages.map((m) => (
					<div key={m.id} className="text-sm">
						<div
							className={`p-2 rounded ${m.role === "user"
								? "bg-blue-100 dark:bg-blue-900 ml-4"
								: "bg-gray-100 dark:bg-gray-800 mr-4"
								}`}
						>
							<strong className="text-xs text-gray-700 dark:text-gray-300">
								{m.role === "user" ? "You" : "AI"}:
							</strong>
							<div className="mt-1 text-gray-800 dark:text-gray-100">
								{m.content}
							</div>
						</div>
					</div>
				))}
				{chatMutation.isPending && (
					<div className="text-sm">
						<div className="p-2 rounded bg-gray-100 dark:bg-gray-800 mr-4">
							<strong className="text-xs text-gray-700 dark:text-gray-300">
								AI:
							</strong>
							<div className="mt-1 text-gray-800 dark:text-gray-100">
								Thinking...
							</div>
						</div>
					</div>
				)}
			</div>

			<form onSubmit={handleSubmit} className="flex gap-2">
				<Input
					value={input}
					placeholder="Say something..."
					onChange={handleInputChange}
					className="flex-1"
					disabled={chatMutation.isPending}
				/>
				<Button
					type="submit"
					size="sm"
					disabled={chatMutation.isPending || !input.trim()}
				>
					{chatMutation.isPending ? "Sending..." : "Send"}
				</Button>
			</form>
		</div>
	);
}

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatBox() {
    const { messages, input, handleInputChange, handleSubmit } = useChat();

    return (
        <div className="h-full flex flex-col">
            {/* Messages area with scroll */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                {messages.map((m) => (
                    <div key={m.id} className="text-sm">
                        <div
                            className={`p-2 rounded ${m.role === "user" ? "bg-blue-100 ml-4" : "bg-gray-100 mr-4"
                                }`}
                        >
                            <strong className="text-xs text-gray-600">
                                {m.role === "user" ? "You" : "AI"}:
                            </strong>
                            <div className="mt-1">{m.content}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input form at bottom */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                    className="flex-1"
                />
                <Button type="submit" size="sm">
                    Send
                </Button>
            </form>
        </div>
    );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalculatorUI } from "@/components/calculator-ui";
import { ChatBox } from "@/components/chat-box";
import { FeatureFlags } from "@/components/feature-flags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const Route = createFileRoute("/calculator")({
	component: Calculator,
});

function Calculator() {
	const [activeTab, setActiveTab] = useState("chat");

	return (
		<div className="relative min-h-screen p-4">
			{/* Main Calculator Content */}
			<div className="flex justify-center">
				<div className="w-full max-w-2xl">
					<CalculatorUI />
				</div>
			</div>

			{/* Bottom Right Chat/Feature Flags Window */}
			<div className="fixed bottom-4 right-4 w-96 h-96">
				<Card className="h-full flex flex-col">
					<CardHeader className="pb-2">
						{/* Tab Switch inside the chat window */}
						<div className="flex space-x-1">
							<Button
								size="sm"
								variant={activeTab === "chat" ? "default" : "outline"}
								onClick={() => setActiveTab("chat")}
							>
								Chat
							</Button>
							<Button
								size="sm"
								variant={activeTab === "feature-flags" ? "default" : "outline"}
								onClick={() => setActiveTab("feature-flags")}
							>
								Feature Flags
							</Button>
						</div>
					</CardHeader>
					<CardContent className="flex-1 overflow-hidden">
						{activeTab === "chat" && <ChatBox />}
						{activeTab === "feature-flags" && <FeatureFlags />}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

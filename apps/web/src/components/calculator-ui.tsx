import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { featureFlags, getActiveTheme } from "@/config/feature-flags";
import { useCalculator } from "@/hooks/use-calculator";
import { trpc } from "@/utils/trpc";

export function CalculatorUI() {
	const { display, handleButtonClick } = useCalculator();
	const theme = getActiveTheme();
	const uiQuery = useQuery(trpc.calculator.getUI.queryOptions());
	const ui = uiQuery.data;
	if (!ui) {
		return <div>Loading...</div>;
	}

	return (
		<Card className={`w-[350px] ${theme.calculator}`}>
			<CardHeader>
				<CardTitle>Calculator</CardTitle>
			</CardHeader>
			<CardContent>
				<div
					className={`col-span-4 h-16 rounded-md flex items-center justify-end text-2xl p-4 ${theme.display}`}
				>
					{display}
				</div>
				<div className="grid grid-cols-4 gap-2 pt-2">
					{ui.buttons.map((button) => (
						<Button
							key={button.value}
							onClick={() => handleButtonClick(button.value)}
							className={`${theme.button} ${button.className === "operator" ? theme.operatorButton : ""} ${button.className === "equals" ? theme.equalsButton : ""} ${button.className}`}
							disabled={
								(button.value === "." && !featureFlags.decimalNumbers) ||
								(button.value === "+/-" && !featureFlags.negativeNumbers)
							}
						>
							{button.label}
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

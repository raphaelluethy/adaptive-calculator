import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { featureFlags, getActiveTheme } from "@/config/feature-flags";
import { useCalculator } from "@/hooks/use-calculator";
import { trpc } from "@/utils/trpc";

function PostmodernCalculator({ display, handleButtonClick, ui }: {
	display: string;
	handleButtonClick: (value: string) => void;
	ui: any;
}) {
	return (
		<div className="relative w-[350px] p-6 rounded-3xl bg-gradient-to-br from-[#ff0080] via-[#7928ca] to-[#ff8a00] text-white shadow-2xl transform rotate-1">
			{/* Floating title */}
			<div className="absolute -top-4 -left-4 bg-[#00ff41] text-black px-4 py-2 rounded-full font-bold transform -rotate-12 shadow-lg">
				{/** biome-ignore lint/suspicious/noCommentText: This is design related */}
				POST//CALC
			</div>

			{/* Glitchy display */}
			<div className="relative mt-6 mb-6">
				<div className="bg-black text-[#00ff41] border-2 border-[#ff0080] shadow-[0_0_20px_#ff0080] p-6 rounded-lg font-mono text-3xl text-right min-h-[80px] flex items-center justify-end relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff0080] to-transparent opacity-20 animate-pulse"></div>
					<span className="relative z-10">{display}</span>
				</div>
			</div>

			{/* Asymmetric button grid */}
			<div className="space-y-3">
				{/* Top row - operators in unconventional positions */}
				<div className="flex gap-3 justify-center">
					{["C", "±", "%", "÷"].map((btn) => {
						const buttonData = ui.buttons.find((b: any) => b.label === btn);
						return (
							<Button
								key={btn}
								onClick={() => handleButtonClick(buttonData?.value || btn)}
								className="w-16 h-16 bg-[#ff0080] border-2 border-[#ffff00] text-black hover:bg-[#ffff00] hover:text-[#ff0080] transform hover:-rotate-3 transition-all duration-200 shadow-[0_0_15px_#ff0080] rounded-full font-bold"
								disabled={
									(buttonData?.value === "." && !featureFlags.decimalNumbers) ||
									(buttonData?.value === "+/-" && !featureFlags.negativeNumbers)
								}
							>
								{btn}
							</Button>
						);
					})}
				</div>

				{/* Number grid with offset layout */}
				<div className="grid grid-cols-4 gap-3 transform -rotate-1">
					{["7", "8", "9", "×"].map((btn) => {
						const buttonData = ui.buttons.find((b: any) => b.label === btn);
						return (
							<Button
								key={btn}
								onClick={() => handleButtonClick(buttonData?.value || btn)}
								className={`h-16 ${btn === "×"
									? "bg-[#ff0080] border-2 border-[#ffff00] text-black hover:bg-[#ffff00] hover:text-[#ff0080] transform hover:-rotate-3 transition-all duration-200 shadow-[0_0_15px_#ff0080]"
									: "bg-[#000] border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transform hover:rotate-3 transition-all duration-200 shadow-[0_0_10px_#00ff41]"
									} rounded-lg font-bold text-xl`}
							>
								{btn}
							</Button>
						);
					})}
				</div>

				<div className="grid grid-cols-4 gap-3">
					{["4", "5", "6", "-"].map((btn) => {
						const buttonData = ui.buttons.find((b: any) => b.label === btn);
						return (
							<Button
								key={btn}
								onClick={() => handleButtonClick(buttonData?.value || btn)}
								className={`h-16 ${btn === "-"
									? "bg-[#ff0080] border-2 border-[#ffff00] text-black hover:bg-[#ffff00] hover:text-[#ff0080] transform hover:-rotate-3 transition-all duration-200 shadow-[0_0_15px_#ff0080]"
									: "bg-[#000] border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transform hover:rotate-3 transition-all duration-200 shadow-[0_0_10px_#00ff41]"
									} rounded-lg font-bold text-xl`}
							>
								{btn}
							</Button>
						);
					})}
				</div>

				<div className="grid grid-cols-4 gap-3 transform rotate-1">
					{["1", "2", "3", "+"].map((btn) => {
						const buttonData = ui.buttons.find((b: any) => b.label === btn);
						return (
							<Button
								key={btn}
								onClick={() => handleButtonClick(buttonData?.value || btn)}
								className={`h-16 ${btn === "+"
									? "bg-[#ff0080] border-2 border-[#ffff00] text-black hover:bg-[#ffff00] hover:text-[#ff0080] transform hover:-rotate-3 transition-all duration-200 shadow-[0_0_15px_#ff0080]"
									: "bg-[#000] border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transform hover:rotate-3 transition-all duration-200 shadow-[0_0_10px_#00ff41]"
									} rounded-lg font-bold text-xl`}
							>
								{btn}
							</Button>
						);
					})}
				</div>

				{/* Bottom row with zero and equals */}
				<div className="flex gap-3">
					<Button
						onClick={() => handleButtonClick("0")}
						className="flex-grow h-16 bg-[#000] border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transform hover:rotate-3 transition-all duration-200 shadow-[0_0_10px_#00ff41] rounded-lg font-bold text-xl"
					>
						0
					</Button>
					<Button
						onClick={() => handleButtonClick(".")}
						className="w-16 h-16 bg-[#000] border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transform hover:rotate-3 transition-all duration-200 shadow-[0_0_10px_#00ff41] rounded-lg font-bold text-xl"
						disabled={!featureFlags.decimalNumbers}
					>
						.
					</Button>
					<Button
						onClick={() => handleButtonClick("=")}
						className="w-20 h-16 bg-gradient-to-r from-[#ff0080] to-[#00ff41] border-2 border-[#ffff00] text-black hover:from-[#00ff41] hover:to-[#ff0080] transform hover:scale-110 transition-all duration-300 shadow-[0_0_20px_#ffff00] rounded-lg font-bold text-xl"
					>
						=
					</Button>
				</div>
			</div>

			{/* Decorative elements */}
			<div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00ff41] rounded-full animate-ping"></div>
			<div className="absolute -top-2 right-4 w-4 h-4 bg-[#ffff00] rounded-full animate-bounce"></div>
		</div>
	);
}

export function CalculatorUI() {
	const { display, handleButtonClick } = useCalculator();
	const theme = getActiveTheme();
	const uiQuery = useQuery(trpc.calculator.getUI.queryOptions());
	const flagsQuery = useQuery(trpc.featureFlags.get.queryOptions());
	const ui = uiQuery.data;
	if (!ui) {
		return <div>Loading...</div>;
	}

	const isPostmodernDesignEnabled = flagsQuery.data?.find(
		(flag) => flag.flag === "calculator-postmodern",
	)?.value;

	// Show postmodern design if enabled
	if (isPostmodernDesignEnabled) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-8">
				<PostmodernCalculator
					display={display}
					handleButtonClick={handleButtonClick}
					ui={ui}
				/>
			</div>
		);
	}

	// Classic design
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

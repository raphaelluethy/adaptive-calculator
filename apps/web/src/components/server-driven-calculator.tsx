import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCalculator } from "@/hooks/use-calculator";
import { trpc } from "@/utils/trpc";
import { themes } from "@/config/themes";

export default function ServerDrivenCalculator() {
	const { display, handleButtonClick } = useCalculator();
	const { data: sduiData, isLoading: isLoadingSDUI } = useQuery(
		trpc.calculator.getSDUI.queryOptions(),
	);
	const { data: featureFlags, isLoading: isLoadingFeatureFlags } = useQuery(
		trpc.featureFlags.get.queryOptions(),
	);

	if (isLoadingSDUI || isLoadingFeatureFlags) {
		return <div>Loading...</div>;
	}

	if (!sduiData) {
		return <div>No SDUI data available</div>;
	}
	if (!featureFlags) {
		return <div>No feature flags available</div>;
	}
	const selectedThemeFlag =
		featureFlags.find((flag) => flag.type === "theme" && flag.value === true)
			?.flag ?? "default-theme";

	// Map the feature flag to the theme key
	const selectedTheme =
		(Object.keys(themes).find(
			(themeKey) =>
				themes[themeKey as keyof typeof themes].flag === selectedThemeFlag,
		) as keyof typeof themes) || "default";

	return (
		<div>
			<div
				className={`mb-2 text-right p-2 border rounded ${sduiData.textSize}`}
			>
				{display}
			</div>
			<div className="grid grid-cols-4 gap-2">
				{sduiData.buttons?.map((btn) => (
					<Button
						key={btn.value}
						onClick={() => handleButtonClick(btn.value)}
						className={`${
							btn.kind === "operator"
								? themes[selectedTheme].operatorButton
								: themes[selectedTheme].button
						} ${sduiData.textSize}`}
					>
						{btn.label}
					</Button>
				))}
			</div>
		</div>
	);
}

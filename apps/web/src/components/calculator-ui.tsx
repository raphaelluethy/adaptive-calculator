import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ServerDrivenCalculator from "@/components/server-driven-calculator";
import { useCalculator } from "@/hooks/use-calculator";
import { trpc } from "@/utils/trpc";
import { themes } from "@/config/themes";

export function CalculatorUI() {
    const { display, handleButtonClick } = useCalculator();
    const { data: uiData, isLoading: isLoadingUI } = useQuery(
        trpc.calculator.getUI.queryOptions()
    );
    const { data: featureFlagsData, isLoading: isLoading } = useQuery(
        trpc.featureFlags.get.queryOptions()
    );

    if (isLoading || isLoadingUI) {
        return <div>Loading...</div>;
    }

    if (!uiData || !featureFlagsData) {
        return <div>No feature flags available</div>;
    }
    const selectedThemeFlag =
        featureFlagsData.find(
            (flag) => flag.type === "theme" && flag.value === true
        )?.flag ?? "default-theme";
    const selectedTheme =
        (Object.keys(themes).find(
            (themeKey) =>
                themes[themeKey as keyof typeof themes].flag ===
                selectedThemeFlag
        ) as keyof typeof themes) || "default";

    const isSDUIEnabled = featureFlagsData.find(
        (f) => f.flag === "sdui"
    )?.value;

    if (isSDUIEnabled) {
        return <ServerDrivenCalculator />;
    }

    // Classic design
    return (
        <Card className={`w-[350px] ${themes[selectedTheme].calculator}`}>
            <CardHeader>
                <CardTitle>Calculator</CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className={`col-span-4 h-16 rounded-md flex items-center justify-end text-2xl p-4 ${themes[selectedTheme].display}`}
                >
                    {display}
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2">
                    {uiData.buttons.map((button) => (
                        <Button
                            key={button.value}
                            onClick={() => handleButtonClick(button.value)}
                            className={`${themes[selectedTheme].button} ${
                                button.className === "operator"
                                    ? themes[selectedTheme].operatorButton
                                    : ""
                            } ${
                                button.className === "equals"
                                    ? themes[selectedTheme].equalsButton
                                    : ""
                            } ${button.className}`}
                            disabled={
                                (button.value === "." &&
                                    !featureFlagsData.find(
                                        (f) => f.flag === "decimal-numbers"
                                    )?.value) ||
                                (button.value === "+/-" &&
                                    !featureFlagsData.find(
                                        (f) => f.flag === "negative-numbers"
                                    )?.value)
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

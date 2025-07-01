import { type Theme, themes } from "./themes";

export const featureFlags = {
	colorScheme: "dark" as Theme,
	decimalNumbers: true,
	negativeNumbers: true,
};

export function getActiveTheme() {
	return themes[featureFlags.colorScheme];
}

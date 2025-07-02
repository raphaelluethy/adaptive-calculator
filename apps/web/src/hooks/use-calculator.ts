import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function useCalculator() {
    const [display, setDisplay] = useState("0");
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] =
        useState(false);
    const { data: featureFlags, isLoading: isLoadingFeatureFlags } = useQuery(
        trpc.featureFlags.get.queryOptions()
    );

    if (isLoadingFeatureFlags) {
        return { display, handleButtonClick: () => {} };
    }

    const handleButtonClick = (value: string) => {
        if (["+", "-", "*", "/"].includes(value)) {
            setFirstOperand(parseFloat(display));
            setOperator(value);
            setWaitingForSecondOperand(true);
            return;
        }

        if (value === "=") {
            if (operator && firstOperand !== null) {
                const secondOperand = parseFloat(display);
                let result = 0;
                switch (operator) {
                    case "+":
                        result = firstOperand + secondOperand;
                        break;
                    case "-":
                        result = firstOperand - secondOperand;
                        break;
                    case "*":
                        result = firstOperand * secondOperand;
                        break;
                    case "/":
                        if (secondOperand === 0) {
                            setDisplay("Error");
                        } else {
                            result = firstOperand / secondOperand;
                        }
                        break;
                }
                setDisplay(result.toString());
                setFirstOperand(null);
                setOperator(null);
                setWaitingForSecondOperand(false);
            }
            return;
        }

        switch (value) {
            case "AC":
                setDisplay("0");
                setFirstOperand(null);
                setOperator(null);
                setWaitingForSecondOperand(false);
                break;
            case "+/-":
                if (
                    featureFlags?.find((f) => f.flag === "negative-numbers")
                        ?.value
                ) {
                    setDisplay((prev) => (parseFloat(prev) * -1).toString());
                }
                break;
            case "%":
                setDisplay((prev) => (parseFloat(prev) / 100).toString());
                break;
            case ".":
                if (
                    featureFlags?.find((f) => f.flag === "decimal-numbers")
                        ?.value &&
                    !display.includes(".")
                ) {
                    setDisplay((prev) => prev + ".");
                }
                break;
            default:
                if (waitingForSecondOperand) {
                    setDisplay(value);
                    setWaitingForSecondOperand(false);
                } else {
                    if (display === "0") {
                        setDisplay(value);
                    } else {
                        setDisplay((prev) => prev + value);
                    }
                }
                break;
        }
    };

    return { display, handleButtonClick };
}

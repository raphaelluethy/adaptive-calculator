import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCalculator } from "@/hooks/use-calculator";
import { trpc } from "@/utils/trpc";

export default function ServerDrivenCalculator() {
  const { display, handleButtonClick } = useCalculator();
  const { data } = useQuery(trpc.calculator.getSDUI.queryOptions());

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className={`mb-2 text-right p-2 border rounded ${data.textSize}`}>{display}</div>
      <div className="grid grid-cols-4 gap-2">
        {data.buttons.map((btn) => (
          <Button
            key={btn.value}
            onClick={() => handleButtonClick(btn.value)}
            className={`${btn.kind === "operator" ? data.operatorColor : data.buttonColor} ${data.textSize}`}
          >
            {btn.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

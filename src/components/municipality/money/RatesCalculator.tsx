import { Home, Receipt } from "lucide-react";
import { cn } from "../../../lib/utils";

export type CalculatorMode = "valuation" | "monthly";

export function RatesCalculator({
  mode,
  onModeChange,
  propertyValuation,
  onPropertyValuationChange,
  monthlyRates,
  onMonthlyRatesChange,
}: {
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
  propertyValuation: number;
  onPropertyValuationChange: (value: number) => void;
  monthlyRates: number;
  onMonthlyRatesChange: (value: number) => void;
}) {
  const options = [
    { id: "monthly" as const, label: "Monthly rates amount", icon: Receipt },
    { id: "valuation" as const, label: "Property valuation", icon: Home },
  ];

  return (
    <div className="rounded-3xl bg-civic-950 p-6 text-white shadow-xl sm:p-8">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1.5">
        {options.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onModeChange(id)}
            className={cn(
              "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition",
              mode === id ? "bg-white text-civic-950" : "text-civic-100 hover:bg-white/10",
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      <label className="mt-7 block">
        <span className="text-sm font-semibold text-civic-100">
          {mode === "monthly" ? "What do you pay in municipal rates each month?" : "What is your municipal property valuation?"}
        </span>
        <span className="mt-2 flex items-center rounded-2xl border border-white/15 bg-white px-4 text-civic-950">
          <span className="font-display text-2xl font-bold">R</span>
          <input
            type="number"
            min="0"
            step={mode === "monthly" ? 100 : 10000}
            value={mode === "monthly" ? monthlyRates : propertyValuation}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (mode === "monthly") onMonthlyRatesChange(value);
              else onPropertyValuationChange(value);
            }}
            className="min-h-16 w-full bg-transparent px-3 text-right font-display text-3xl font-bold outline-none"
          />
        </span>
      </label>
      <p className="mt-4 text-xs leading-5 text-civic-300">
        This is an educational estimate. Your municipal account may include rebates, service charges and adjustments not represented here.
      </p>
    </div>
  );
}

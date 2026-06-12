import { Droplets, Lightbulb, Route, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MunicipalImpactEstimate } from "../../../types";

const icons: Record<string, LucideIcon> = {
  road: Route,
  lightbulb: Lightbulb,
  trash: Trash2,
  droplets: Droplets,
};

export function ImpactInsightCard({
  estimate,
  annualContribution,
}: {
  estimate: MunicipalImpactEstimate;
  annualContribution: number;
}) {
  const Icon = icons[estimate.iconName] || Route;
  const units = annualContribution / estimate.estimatedCostPerUnit;
  return (
    <div className="rounded-2xl border bg-white p-5">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-civic-50 text-civic-800"><Icon className="h-5 w-5" /></span>
      <p className="mt-5 font-display text-3xl font-bold text-civic-950">{units < 1 ? units.toFixed(1) : Math.floor(units).toLocaleString("en-ZA")}</p>
      <p className="mt-1 text-sm leading-6 text-stone-500">{estimate.unitLabel}</p>
    </div>
  );
}

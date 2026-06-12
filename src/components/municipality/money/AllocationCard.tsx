import type { BudgetAllocationPercentage } from "../../../types";

export function AllocationCard({
  allocation,
  annualContribution,
  money,
}: {
  allocation: BudgetAllocationPercentage;
  annualContribution: number;
  money: (value: number) => string;
}) {
  const annualAmount = annualContribution * (allocation.percentage / 100);
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-xl font-bold text-civic-950">{allocation.allocationName}</h3>
        <span className="rounded-full bg-civic-50 px-3 py-1 text-sm font-bold text-civic-800">{allocation.percentage.toFixed(1)}%</span>
      </div>
      <p className="mt-6 text-lg font-bold text-stone-800">{money(annualAmount)} <span className="text-xs font-medium text-stone-400">per year</span></p>
      <p className="mt-1 text-sm text-stone-500">{money(annualAmount / 12)} per month</p>
    </div>
  );
}

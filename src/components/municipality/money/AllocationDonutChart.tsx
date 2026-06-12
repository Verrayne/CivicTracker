import { BreakdownChart } from "../budget-v2/BreakdownChart";
import type { BudgetAllocationPercentage } from "../../../types";

export function AllocationDonutChart({
  allocations,
  annualContribution,
  money,
}: {
  allocations: BudgetAllocationPercentage[];
  annualContribution: number;
  money: (value: number) => string;
}) {
  return (
    <BreakdownChart
      items={allocations.map((allocation) => ({
        id: allocation.id,
        label: allocation.allocationName,
        value: annualContribution * (allocation.percentage / 100),
      }))}
      valueFormatter={money}
    />
  );
}

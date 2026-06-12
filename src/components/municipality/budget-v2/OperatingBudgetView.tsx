import { Banknote, Droplets, Hammer, Landmark, Lightbulb, Receipt, ShieldAlert, Users, WalletCards } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import { ErrorState, LoadingSpinner } from "../../feedback/States";
import type { BudgetV2Summary } from "../../../types";
import { BreakdownChart } from "./BreakdownChart";
import { BudgetSource, BudgetV2Shell } from "./BudgetV2Shell";
import { HistoricalBudgetTable } from "./HistoricalBudgetTable";
import { ChartCard } from "../ChartCard";
import { StatisticCard } from "../StatisticCard";
import { TrendChart } from "../TrendChart";

const money = (value: number) => new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  notation: "compact",
  maximumFractionDigits: 2,
}).format(value);

export function OperatingBudgetView({
  kind,
  query,
}: {
  kind: "Revenue" | "Expenditure";
  query: UseQueryResult<BudgetV2Summary, Error>;
}) {
  const data = query.data;
  const categoryValue = (name: string) => data?.categories.find(({ category }) => category === name)?.amount || 0;
  const summaryCards = kind === "Revenue" ? [
    { label: "Total Revenue", value: data?.total || 0, icon: WalletCards },
    { label: "Property Rates", value: categoryValue("Property Rates"), icon: Receipt },
    { label: "Electricity Revenue", value: categoryValue("Electricity"), icon: Lightbulb },
    { label: "Water Revenue", value: categoryValue("Water"), icon: Droplets },
    { label: "Fuel Levy", value: categoryValue("Fuel Levy"), icon: Banknote },
    { label: "Grant Funding", value: categoryValue("Transfers Recognised Operational"), icon: Landmark },
  ] : [
    { label: "Total Expenditure", value: data?.total || 0, icon: WalletCards },
    { label: "Employee Costs", value: categoryValue("Employee Related Costs"), icon: Users },
    { label: "Bulk Purchases", value: categoryValue("Bulk Purchases"), icon: Banknote },
    { label: "Repairs and Maintenance", value: categoryValue("Repairs and Maintenance"), icon: Hammer },
    { label: "Debt Impairment", value: categoryValue("Debt Impairment"), icon: ShieldAlert },
  ];

  return (
    <BudgetV2Shell>
      {query.isLoading ? <LoadingSpinner label={`Loading ${kind.toLowerCase()} data...`} /> : query.isError || !data ? (
        <ErrorState message={query.error?.message || `${kind} data is unavailable.`} retry={() => query.refetch()} />
      ) : (
        <>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">{data.financialYear} {data.scenario}</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-civic-950">{kind} overview</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <StatisticCard key={card.label} label={card.label} value={money(card.value)} icon={card.icon} />
            ))}
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <ChartCard title={`${kind} composition`} description={`The main categories in Tshwane's ${data.financialYear} ${kind.toLowerCase()} budget.`}>
              <BreakdownChart
                items={data.categories.map((item) => ({ id: item.id, label: item.category, value: item.amount }))}
                valueFormatter={money}
              />
            </ChartCard>
            <ChartCard title="Four-year trend" description="Adjustment budget, adopted budget and outer-year estimates.">
              <TrendChart
                labels={data.trend.map(({ financialYear }) => financialYear)}
                series={[{ label: kind, color: kind === "Revenue" ? "#266e4e" : "#d77b48", values: data.trend.map(({ amount }) => amount) }]}
                valueFormatter={money}
              />
            </ChartCard>
          </div>

          <div className="mt-10">
            <ChartCard title={`${kind} drill-down`} description="Search categories or sort the table by amount.">
              <HistoricalBudgetTable facts={data.allFacts} valueFormatter={money} />
            </ChartCard>
          </div>
          <BudgetSource url={data.sourceUrl} />
        </>
      )}
    </BudgetV2Shell>
  );
}

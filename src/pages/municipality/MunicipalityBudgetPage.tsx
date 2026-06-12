import { Banknote, Building2, Landmark, WalletCards } from "lucide-react";
import { BudgetAllocationChart } from "../../components/municipality/BudgetAllocationChart";
import { ChartCard } from "../../components/municipality/ChartCard";
import { DocumentList } from "../../components/municipality/DocumentList";
import { MunicipalityShell, SampleDataNotice } from "../../components/municipality/MunicipalityShell";
import { StatisticCard } from "../../components/municipality/StatisticCard";
import { TrendChart } from "../../components/municipality/TrendChart";
import { ErrorState, LoadingSpinner } from "../../components/feedback/States";
import { useMunicipality } from "../../context/municipality";
import { useBudget } from "../../hooks/useBudget";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function MunicipalityBudgetPage() {
  const { selectedMunicipalityId } = useMunicipality();
  const query = useBudget(selectedMunicipalityId);

  return (
    <MunicipalityShell title="Municipal budget" description="See where municipal money comes from, where it goes and how the budget changes over time.">
      {query.isLoading ? <LoadingSpinner label="Loading budget data..." /> : query.isError || !query.data ? (
        <ErrorState message={query.error?.message || "Budget information is unavailable."} retry={() => query.refetch()} />
      ) : (
        <>
          {query.data.currentSummary?.is_sample_data && <SampleDataNotice />}
          {query.data.currentSummary && (
            <>
              <section>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Budget summary</p>
                    <h2 className="mt-2 font-display text-3xl font-bold text-civic-950">{query.data.currentSummary.financial_year} financial year</h2>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatisticCard label="Total Revenue" value={money(query.data.currentSummary.total_revenue)} icon={WalletCards} />
                  <StatisticCard label="Total Expenditure" value={money(query.data.currentSummary.total_expenditure)} icon={Landmark} />
                  <StatisticCard label="Capital Budget" value={money(query.data.currentSummary.capital_budget)} icon={Building2} />
                  <StatisticCard label="Operating Budget" value={money(query.data.currentSummary.operating_budget)} icon={Banknote} />
                </div>
              </section>

              <div className="mt-10">
                <ChartCard title="Budget allocation" description="How the current expenditure budget is divided by service category.">
                  <BudgetAllocationChart allocations={query.data.allocations} />
                  <div className="mt-7 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="border-b text-xs uppercase tracking-wider text-stone-400">
                        <tr><th className="pb-3">Category</th><th className="pb-3">Amount</th><th className="pb-3 text-right">Percentage</th></tr>
                      </thead>
                      <tbody className="divide-y">
                        {query.data.allocations.map((allocation) => (
                          <tr key={allocation.id}>
                            <td className="py-3 font-semibold text-civic-950">{allocation.category}</td>
                            <td className="py-3 text-stone-600">{money(allocation.amount)}</td>
                            <td className="py-3 text-right font-bold text-stone-700">{allocation.percentage.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ChartCard>
              </div>
            </>
          )}

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
            <ChartCard title="Historical budget trends" description="Revenue and expenditure across available financial years.">
              <TrendChart
                labels={[...query.data.summaries].reverse().map(({ financial_year }) => financial_year)}
                series={[
                  { label: "Revenue", color: "#266e4e", values: [...query.data.summaries].reverse().map(({ total_revenue }) => total_revenue) },
                  { label: "Expenditure", color: "#d77b48", values: [...query.data.summaries].reverse().map(({ total_expenditure }) => total_expenditure) },
                ]}
                valueFormatter={money}
              />
            </ChartCard>
            <ChartCard title="Budget documents" description="Open source documents published by the municipality.">
              <DocumentList documents={query.data.documents} />
            </ChartCard>
          </div>
        </>
      )}
    </MunicipalityShell>
  );
}

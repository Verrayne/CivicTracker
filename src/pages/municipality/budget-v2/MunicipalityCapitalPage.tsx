import { useState } from "react";
import { Droplets, Home, Landmark, Lightbulb, Route } from "lucide-react";
import { ErrorState, LoadingSpinner } from "../../../components/feedback/States";
import { BreakdownChart } from "../../../components/municipality/budget-v2/BreakdownChart";
import { BudgetDataTable } from "../../../components/municipality/budget-v2/BudgetDataTable";
import { BudgetSource, BudgetV2Shell } from "../../../components/municipality/budget-v2/BudgetV2Shell";
import { CapitalProjectDrawer } from "../../../components/municipality/budget-v2/CapitalProjectDrawer";
import { ChartCard } from "../../../components/municipality/ChartCard";
import { StatisticCard } from "../../../components/municipality/StatisticCard";
import { useMunicipality } from "../../../context/municipality";
import { useCapitalBudget } from "../../../hooks/useBudgetV2";
import type { CapitalProject } from "../../../types";

const money = (value: number) => new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  notation: "compact",
  maximumFractionDigits: 2,
}).format(value);

export function MunicipalityCapitalPage() {
  const { selectedMunicipalityId } = useMunicipality();
  const query = useCapitalBudget(selectedMunicipalityId);
  const [selectedProject, setSelectedProject] = useState<CapitalProject | null>(null);
  const data = query.data;
  const summary = data?.summary;
  const projects = data?.projects.filter(({ financialYear }) => financialYear === summary?.financialYear) || [];
  const departmentValue = (name: string) =>
    summary?.departmentBudgets.find(({ department }) => department === name)?.amount || 0;

  return (
    <BudgetV2Shell>
      {query.isLoading ? <LoadingSpinner label="Loading capital budget..." /> : query.isError || !summary ? (
        <ErrorState message={query.error?.message || "Capital budget data is unavailable."} retry={() => query.refetch()} />
      ) : (
        <>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">{summary.financialYear} budget</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-civic-950">Capital programme</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatisticCard label="Capital Budget" value={money(summary.total)} icon={Landmark} />
            <StatisticCard label="Roads and Transport" value={money(departmentValue("Roads and Transport"))} icon={Route} />
            <StatisticCard label="Water and Sanitation" value={money(departmentValue("Water and Sanitation"))} icon={Droplets} />
            <StatisticCard label="Energy and Electricity" value={money(departmentValue("Energy and Electricity"))} icon={Lightbulb} />
            <StatisticCard label="Human Settlements" value={money(departmentValue("Human Settlements"))} icon={Home} />
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            <ChartCard title="Funding sources" description="How the capital programme is funded.">
              <BreakdownChart
                items={summary.fundingSources.filter(({ amount }) => amount > 0).map((item) => ({ id: item.id, label: item.source, value: item.amount }))}
                valueFormatter={money}
              />
            </ChartCard>
            <ChartCard title="Department allocation" description="Capital budgets allocated to municipal departments.">
              <BreakdownChart
                items={summary.departmentBudgets.filter(({ amount }) => amount > 0).map((item) => ({ id: item.id, label: item.department, value: item.amount }))}
                valueFormatter={money}
              />
            </ChartCard>
          </div>

          <div className="mt-10">
            <ChartCard title="Capital projects" description="Select a row to see the project location, purpose and source.">
              <BudgetDataTable
                labelHeading="Project"
                valueFormatter={money}
                onRowClick={(id) => setSelectedProject(projects.find((project) => project.id === id) || null)}
                rows={projects.map((project) => ({
                  id: project.id,
                  label: project.name,
                  amount: project.budgetAmount,
                  percentage: summary.total ? (project.budgetAmount / summary.total) * 100 : 0,
                  meta: [project.department, project.location].filter(Boolean).join(" · "),
                }))}
              />
            </ChartCard>
          </div>
          <BudgetSource url={summary.sourceUrl} />
          <CapitalProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} money={money} />
        </>
      )}
    </BudgetV2Shell>
  );
}

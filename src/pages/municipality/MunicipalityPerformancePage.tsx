import { CheckCircle2, Clock3, Gauge, ListChecks, Lightbulb, Trash2, Waves } from "lucide-react";
import { ChartCard } from "../../components/municipality/ChartCard";
import { KpiScorecard } from "../../components/municipality/KpiScorecard";
import { MunicipalityShell, SampleDataNotice } from "../../components/municipality/MunicipalityShell";
import { StatisticCard } from "../../components/municipality/StatisticCard";
import { TrendChart } from "../../components/municipality/TrendChart";
import { ErrorState, LoadingSpinner } from "../../components/feedback/States";
import { useMunicipality } from "../../context/municipality";
import { usePerformance } from "../../hooks/usePerformance";

const serviceIcons = [ListChecks, Lightbulb, Waves, Trash2];

export function MunicipalityPerformancePage() {
  const { selectedMunicipalityId } = useMunicipality();
  const query = usePerformance(selectedMunicipalityId);

  return (
    <MunicipalityShell title="Municipal performance" description="Follow issue outcomes, service delivery measures and departmental performance in one transparent view.">
      {query.isLoading ? <LoadingSpinner label="Loading performance data..." /> : query.isError || !query.data ? (
        <ErrorState message={query.error?.message || "Performance information is unavailable."} retry={() => query.refetch()} />
      ) : (
        <>
          <SampleDataNotice />
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">WardWorks performance</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-civic-950">Live issue outcomes</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatisticCard label="Total Issues Reported" value={query.data.issueMetrics.total.toLocaleString("en-ZA")} icon={ListChecks} />
              <StatisticCard label="Total Issues Resolved" value={query.data.issueMetrics.resolved.toLocaleString("en-ZA")} icon={CheckCircle2} />
              <StatisticCard label="Open Issues" value={query.data.issueMetrics.open.toLocaleString("en-ZA")} icon={Clock3} />
              <StatisticCard label="Resolution Rate" value={`${query.data.issueMetrics.resolutionRate.toFixed(1)}%`} icon={Gauge} />
              <StatisticCard label="Average Resolution Time" value={`${query.data.issueMetrics.averageResolutionDays.toFixed(1)} days`} icon={Clock3} />
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-3xl font-bold text-civic-950">Service delivery metrics</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(query.data.serviceMetrics).map(([label, value], index) => (
                <StatisticCard key={label} label={label} value={value.toLocaleString("en-ZA")} hint="Resolved WardWorks reports" icon={serviceIcons[index]} />
              ))}
            </div>
          </section>

          <div className="mt-12">
            <ChartCard title="Monthly trends" description="New reports, resolved reports and average resolution time over the past six months.">
              <TrendChart
                labels={query.data.monthlyTrends.map(({ month }) => month)}
                series={[
                  { label: "New Issues", color: "#0d3b2e", values: query.data.monthlyTrends.map(({ newIssues }) => newIssues) },
                  { label: "Resolved Issues", color: "#58a77e", values: query.data.monthlyTrends.map(({ resolvedIssues }) => resolvedIssues) },
                  { label: "Resolution Time (days)", color: "#d77b48", values: query.data.monthlyTrends.map(({ averageResolutionDays }) => averageResolutionDays) },
                ]}
              />
            </ChartCard>
          </div>

          <section className="mt-12">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-display text-3xl font-bold text-civic-950">Department performance</h2>
                <p className="mt-2 text-sm text-stone-500">Green is 90% or higher, amber is 70% or higher, and red is below 70%.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {query.data.kpis.map((kpi) => <KpiScorecard key={kpi.id} kpi={kpi} />)}
            </div>
          </section>
        </>
      )}
    </MunicipalityShell>
  );
}

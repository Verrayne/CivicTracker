import { ArrowRight, Banknote, BriefcaseBusiness, Building2, CheckCircle2, Clock3, Landmark, Layers3, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorState, LoadingSpinner } from "../../components/feedback/States";
import { MunicipalityShell, SampleDataNotice } from "../../components/municipality/MunicipalityShell";
import { StatisticCard } from "../../components/municipality/StatisticCard";
import { useMunicipality } from "../../context/municipality";
import { useMunicipalityOverview } from "../../hooks/useMunicipality";

function money(value: number | undefined) {
  if (value === undefined) return "Not available";
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

const quickLinks = [
  { to: "/municipality/budget", title: "Budget", text: "See revenue, expenditure, allocations and financial documents.", icon: Banknote },
  { to: "/municipality/budget-v2", title: "Budget 2.0", text: "Drill into the official MTREF revenue, expenditure and capital programme.", icon: Landmark },
  { to: "/municipality/management", title: "Management", text: "Understand the leadership structure and who is responsible.", icon: Users },
  { to: "/municipality/performance", title: "Performance", text: "Track service delivery outcomes and WardWorks resolution trends.", icon: CheckCircle2 },
];

export function MunicipalityOverviewPage() {
  const { selectedMunicipalityId } = useMunicipality();
  const query = useMunicipalityOverview(selectedMunicipalityId);

  return (
    <MunicipalityShell title="Municipality overview" description="A clear view of how the municipality is funded, who runs it and how services are performing.">
      {query.isLoading ? <LoadingSpinner label="Loading municipality overview..." /> : query.isError || !query.data ? (
        <ErrorState message={query.error?.message || "Municipality information is unavailable."} retry={() => query.refetch()} />
      ) : (
        <>
          {query.data.latestBudget?.is_sample_data && <SampleDataNotice />}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatisticCard label="Annual Budget" value={money(query.data.latestBudget?.total_expenditure)} hint={query.data.latestBudget?.financial_year} icon={Landmark} />
            <StatisticCard label="Capital Budget" value={money(query.data.latestBudget?.capital_budget)} hint="Infrastructure and long-term assets" icon={Building2} />
            <StatisticCard label="Operating Budget" value={money(query.data.latestBudget?.operating_budget)} hint="Day-to-day municipal services" icon={Banknote} />
            <StatisticCard label="Number of Employees" value={(query.data.municipality.employee_count || 0).toLocaleString("en-ZA")} hint="Demonstration municipal workforce figure" icon={BriefcaseBusiness} />
            <StatisticCard label="Number of Departments" value={query.data.departmentCount.toLocaleString("en-ZA")} icon={Layers3} />
            <StatisticCard label="Current Municipal Manager" value={query.data.municipalManager?.full_name || "Not available"} hint={query.data.municipalManager?.position} icon={Users} />
            <StatisticCard label="Open WardWorks Issues" value={query.data.issueMetrics.open.toLocaleString("en-ZA")} hint="Live WardWorks data" icon={Clock3} />
            <StatisticCard label="Resolved WardWorks Issues" value={query.data.issueMetrics.resolved.toLocaleString("en-ZA")} hint="Resolved or closed" icon={CheckCircle2} />
            <StatisticCard label="Average Resolution Time" value={`${query.data.issueMetrics.averageResolutionDays.toFixed(1)} days`} hint="Based on resolved WardWorks issues" icon={Clock3} />
          </div>

          <section className="mt-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Explore the municipality</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-civic-950">Follow the money, people and results</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {quickLinks.map(({ to, title, text, icon: Icon }) => (
                <Link key={to} to={to} className="group rounded-2xl border bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-civic-300">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-civic-50 text-civic-700"><Icon className="h-6 w-6" /></span>
                  <h3 className="mt-6 font-display text-2xl font-bold text-civic-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-500">{text}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-civic-800">View {title.toLowerCase()} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </MunicipalityShell>
  );
}

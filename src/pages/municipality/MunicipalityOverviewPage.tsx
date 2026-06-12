import { BriefcaseBusiness, Clock3, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorState, LoadingSpinner } from "../../components/feedback/States";
import { MunicipalityShell } from "../../components/municipality/MunicipalityShell";
import { StatisticCard } from "../../components/municipality/StatisticCard";
import { useMunicipality } from "../../context/municipality";
import { useMunicipalityOverview } from "../../hooks/useMunicipality";

function money(value: number | undefined) {
  if (value === undefined) return "Not available";
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function MunicipalityOverviewPage() {
  const { selectedMunicipality, selectedMunicipalityId } = useMunicipality();
  const query = useMunicipalityOverview(selectedMunicipalityId);
  const municipalityName = (selectedMunicipality?.name || "Municipality").replace(/^City of /i, "");

  return (
    <MunicipalityShell title="Municipal Overview" description="How is the municipality is funded, who runs it and how is it performing.">
      {query.isLoading ? <LoadingSpinner label="Loading municipality overview..." /> : query.isError || !query.data ? (
        <ErrorState message={query.error?.message || "Municipality information is unavailable."} retry={() => query.refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/municipality/budget-v2" className="rounded-2xl transition hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-civic-500 focus:ring-offset-2">
              <StatisticCard label="Annual Budget" value={money(query.data.annualBudget.amount)} hint={`${query.data.annualBudget.financialYear} expenditure budget`} icon={Landmark} />
            </Link>
            <StatisticCard label="Number of Employees" value={(query.data.municipality.employee_count || 0).toLocaleString("en-ZA")} hint="2023 figure" icon={BriefcaseBusiness} />
            <StatisticCard label="Open WardWorks Issues" value={query.data.issueMetrics.open.toLocaleString("en-ZA")} hint="Live WardWorks data" icon={Clock3} />
          </div>

          <section className="mt-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Coming up in {municipalityName}</p>
          </section>
        </>
      )}
    </MunicipalityShell>
  );
}

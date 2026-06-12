import { BriefcaseBusiness, CalendarDays, Clock3, ExternalLink, Landmark, Vote } from "lucide-react";
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
            <div className="mt-7 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
              <div className="rounded-2xl border bg-white p-6 shadow-card sm:p-8">
                <div className="relative pl-12">
                  <span className="absolute left-4 top-3 h-[calc(100%-1rem)] w-px bg-civic-200" />
                  <span className="absolute left-0 top-0 grid h-9 w-9 place-items-center rounded-full bg-civic-900 text-white ring-4 ring-civic-50">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay">4 November 2026</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-civic-950">Municipal elections</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-500">
                    Residents will vote for the councillors and parties that will represent their communities in local government.
                  </p>
                </div>
              </div>

              <a
                href="https://www.elections.org.za/pw/voter/voter-information"
                target="_blank"
                rel="noreferrer"
                className="group flex rounded-2xl bg-civic-950 p-6 text-white shadow-xl transition hover:-translate-y-1 hover:bg-civic-900 focus:outline-none focus:ring-2 focus:ring-civic-500 focus:ring-offset-2 sm:p-8"
              >
                <div className="flex w-full items-start gap-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-civic-200">
                    <Vote className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic-300">Be ready to vote</p>
                    <h2 className="mt-2 font-display text-2xl font-bold">Check your voter registration status</h2>
                    <p className="mt-3 text-sm leading-6 text-civic-200">
                      Confirm that you are registered and check the voting station linked to your address on the official Electoral Commission website.
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white">
                      Check my registration <ExternalLink className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </section>
        </>
      )}
    </MunicipalityShell>
  );
}

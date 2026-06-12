import { useMemo, useState } from "react";
import { Calculator, Sparkles } from "lucide-react";
import { ErrorState, LoadingSpinner } from "../../components/feedback/States";
import { MunicipalityShell } from "../../components/municipality/MunicipalityShell";
import { AllocationCard } from "../../components/municipality/money/AllocationCard";
import { AllocationDonutChart } from "../../components/municipality/money/AllocationDonutChart";
import { ContributionComparisonCard } from "../../components/municipality/money/ContributionComparisonCard";
import { ContributionSlider } from "../../components/municipality/money/ContributionSlider";
import { ImpactInsightCard } from "../../components/municipality/money/ImpactInsightCard";
import { RatesCalculator, type CalculatorMode } from "../../components/municipality/money/RatesCalculator";
import { ChartCard } from "../../components/municipality/ChartCard";
import { useMunicipality } from "../../context/municipality";
import { useWhereMoneyGoes } from "../../hooks/useWhereMoneyGoes";
import { calculateFromMonthlyRates, calculateFromPropertyValuation } from "../../services/ratesCalculatorService";

const money = (value: number) => new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
}).format(value);

export function WhereYourMoneyGoesPage() {
  const { selectedMunicipalityId } = useMunicipality();
  const query = useWhereMoneyGoes(selectedMunicipalityId);
  const [mode, setMode] = useState<CalculatorMode>("monthly");
  const [monthlyRates, setMonthlyRates] = useState(2500);
  const [propertyValuation, setPropertyValuation] = useState(2000000);
  const contribution = useMemo(() => {
    if (!query.data) return calculateFromMonthlyRates(monthlyRates);
    return mode === "monthly"
      ? calculateFromMonthlyRates(monthlyRates)
      : calculateFromPropertyValuation(propertyValuation, query.data.ratesParameters);
  }, [mode, monthlyRates, propertyValuation, query.data]);

  return (
    <MunicipalityShell
      title="Where your money goes"
      description="Turn your municipal rates contribution into a simple view of the services and infrastructure it helps fund."
    >
      {query.isLoading ? <LoadingSpinner label="Loading the rates calculator..." /> : query.isError || !query.data ? (
        <ErrorState message={query.error?.message || "The contribution calculator is unavailable."} retry={() => query.refetch()} />
      ) : (
        <>
          <section className="grid items-start gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Make the budget personal</p>
              <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-civic-950">
                Ever wondered where your municipal rates and taxes go?
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-stone-600">
                Enter your monthly property rates or municipal valuation. We will translate the estimate into resident-friendly service allocations.
              </p>
              <div className="mt-8 rounded-2xl border border-civic-200 bg-civic-50 p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-civic-900"><Calculator className="h-4 w-4" /> Your estimated contribution</p>
                <p className="mt-3 font-display text-4xl font-bold text-civic-950">{money(contribution.annualContribution)}</p>
                <p className="mt-1 text-sm text-stone-500">per year · {money(contribution.monthlyContribution)} per month</p>
              </div>
            </div>
            <RatesCalculator
              mode={mode}
              onModeChange={setMode}
              propertyValuation={propertyValuation}
              onPropertyValuationChange={setPropertyValuation}
              monthlyRates={monthlyRates}
              onMonthlyRatesChange={setMonthlyRates}
            />
          </section>

          <div className="mt-8">
            <ContributionSlider
              value={contribution.monthlyContribution}
              onChange={(value) => {
                setMode("monthly");
                setMonthlyRates(value);
              }}
              money={money}
            />
          </div>

          <section className="mt-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Your contribution at work</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-civic-950">
              Your {money(contribution.monthlyContribution)}/month helps fund:
            </h2>
            <div className="mt-7">
              <ChartCard title="Service allocation" description={`Based on ${query.data.allocations[0]?.financialYear || "current"} departmental operating expenditure proportions.`}>
                <AllocationDonutChart allocations={query.data.allocations} annualContribution={contribution.annualContribution} money={money} />
              </ChartCard>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {query.data.allocations.map((allocation) => (
                <AllocationCard key={allocation.id} allocation={allocation} annualContribution={contribution.annualContribution} money={money} />
              ))}
            </div>
          </section>

          <section className="mt-14 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
            <ContributionComparisonCard
              annualContribution={contribution.annualContribution}
              municipalityBudget={query.data.municipalityTotalBudget}
              money={money}
            />
            <div className="rounded-3xl border bg-white p-6 shadow-card sm:p-8">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-clay"><Sparkles className="h-4 w-4" /> Illustrative impact</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-civic-950">What that could help fund</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {query.data.impactEstimates.map((estimate) => (
                  <ImpactInsightCard key={estimate.id} estimate={estimate} annualContribution={contribution.annualContribution} />
                ))}
              </div>
              <p className="mt-5 text-xs leading-5 text-stone-500">Illustrative estimates only. Actual municipal costs vary by project, location and procurement.</p>
            </div>
          </section>

          <section className="mt-14 rounded-3xl border border-dashed border-civic-300 bg-civic-50 p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic-700">Future scenario</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-civic-950">What if everyone paid?</h2>
            <p className="mt-3 max-w-2xl leading-7 text-stone-600">
              A future version will model potential ward contributions using household estimates and average rates, without changing this calculator’s underlying architecture.
            </p>
          </section>

          <div className="mt-8 text-xs leading-5 text-stone-500">
            <p>{query.data.allocations[0]?.sourceNote}</p>
            <p className="mt-2">
              Residential valuation estimate uses the {query.data.ratesParameters.financialYear} tariff of {query.data.ratesParameters.tariffCentsPerRand} cents per rand after a {money(query.data.ratesParameters.valuationReduction)} valuation reduction.{" "}
              {query.data.ratesParameters.sourceUrl && <a className="font-semibold text-civic-700 underline" href={query.data.ratesParameters.sourceUrl} target="_blank" rel="noreferrer">View MTREF source</a>}
            </p>
          </div>
        </>
      )}
    </MunicipalityShell>
  );
}

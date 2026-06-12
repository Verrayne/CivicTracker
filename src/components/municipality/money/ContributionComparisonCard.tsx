export function ContributionComparisonCard({
  annualContribution,
  municipalityBudget,
  money,
}: {
  annualContribution: number;
  municipalityBudget: number;
  money: (value: number) => string;
}) {
  const percentage = municipalityBudget ? (annualContribution / municipalityBudget) * 100 : 0;
  return (
    <div className="rounded-3xl bg-civic-900 p-6 text-white shadow-xl sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic-300">You and the municipality</p>
      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <div><p className="text-sm text-civic-200">Your annual contribution</p><p className="mt-2 font-display text-3xl font-bold">{money(annualContribution)}</p></div>
        <div><p className="text-sm text-civic-200">Municipality total budget</p><p className="mt-2 font-display text-3xl font-bold">{money(municipalityBudget)}</p></div>
      </div>
      <div className="mt-8 border-t border-white/15 pt-6">
        <p className="text-sm text-civic-200">Your contribution represents approximately</p>
        <p className="mt-2 font-display text-4xl font-bold text-civic-200">{percentage.toFixed(6)}%</p>
      </div>
    </div>
  );
}

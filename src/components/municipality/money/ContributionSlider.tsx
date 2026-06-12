export function ContributionSlider({
  value,
  onChange,
  money,
}: {
  value: number;
  onChange: (value: number) => void;
  money: (value: number) => string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Monthly contribution</p>
          <p className="mt-2 font-display text-3xl font-bold text-civic-950">{money(value)}</p>
        </div>
        <p className="text-xs text-stone-400">R100 – R10,000</p>
      </div>
      <input
        aria-label="Monthly contribution"
        type="range"
        min="100"
        max="10000"
        step="100"
        value={Math.min(10000, Math.max(100, value))}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-6 w-full accent-civic-700"
      />
    </div>
  );
}

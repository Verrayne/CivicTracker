import type { MunicipalBudgetAllocation } from "../../types";

const colors = ["#0d3b2e", "#266e4e", "#358a63", "#58a77e", "#8cc7a7", "#d77b48", "#c49a6c", "#776f65"];

export function BudgetAllocationChart({ allocations }: { allocations: MunicipalBudgetAllocation[] }) {
  let offset = 0;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[260px_1fr]">
      <div className="mx-auto w-full max-w-64">
        <svg viewBox="0 0 200 200" role="img" aria-label="Municipal budget allocation donut chart">
          <circle cx="100" cy="100" r="70" fill="none" stroke="#eeeae1" strokeWidth="34" />
          {allocations.map((allocation, index) => {
            const length = allocation.percentage * 4.398;
            const element = (
              <circle
                key={allocation.id}
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth="34"
                strokeDasharray={`${length} ${439.8 - length}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 100 100)"
              />
            );
            offset += length;
            return element;
          })}
          <text x="100" y="94" textAnchor="middle" className="fill-civic-950 text-[11px] font-bold">ALLOCATED</text>
          <text x="100" y="115" textAnchor="middle" className="fill-stone-500 text-[10px]">100%</text>
        </svg>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {allocations.map((allocation, index) => (
          <div key={allocation.id} className="flex items-center gap-3 rounded-xl bg-parchment p-3">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-800">{allocation.category}</p>
              <p className="text-xs text-stone-500">{allocation.percentage.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const colors = ["#0d3b2e", "#266e4e", "#358a63", "#58a77e", "#8cc7a7", "#d77b48", "#c49a6c", "#776f65", "#a8a29e"];

export interface BreakdownItem {
  id: string;
  label: string;
  value: number;
}

export function BreakdownChart({ items, valueFormatter }: { items: BreakdownItem[]; valueFormatter: (value: number) => string }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[250px_1fr]">
      <div className="mx-auto w-full max-w-64">
        <svg viewBox="0 0 200 200" role="img" aria-label="Budget breakdown donut chart">
          <circle cx="100" cy="100" r="70" fill="none" stroke="#eeeae1" strokeWidth="34" />
          {items.map((item, index) => {
            const percentage = total ? item.value / total : 0;
            const length = percentage * 439.8;
            const circle = (
              <circle
                key={item.id}
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth="34"
                strokeDasharray={`${length} ${439.8 - length}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 100 100)"
              >
                <title>{`${item.label}: ${valueFormatter(item.value)}`}</title>
              </circle>
            );
            offset += length;
            return circle;
          })}
          <text x="100" y="94" textAnchor="middle" className="fill-civic-950 text-[10px] font-bold">TOTAL</text>
          <text x="100" y="114" textAnchor="middle" className="fill-stone-500 text-[8px]">{valueFormatter(total)}</text>
        </svg>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl bg-parchment p-3">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-800">{item.label}</p>
              <p className="text-xs text-stone-500">{total ? `${((item.value / total) * 100).toFixed(1)}%` : "0%"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

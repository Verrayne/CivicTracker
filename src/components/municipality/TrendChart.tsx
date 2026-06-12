export interface TrendSeries {
  label: string;
  color: string;
  values: number[];
}

export function TrendChart({
  labels,
  series,
  valueFormatter = (value) => value.toLocaleString("en-ZA"),
}: {
  labels: string[];
  series: TrendSeries[];
  valueFormatter?: (value: number) => string;
}) {
  const allValues = series.flatMap(({ values }) => values);
  const max = Math.max(...allValues, 1);
  const min = Math.min(...allValues, 0);
  const range = Math.max(max - min, 1);
  const point = (value: number, index: number, count: number) => ({
    x: count <= 1 ? 50 : 8 + (index / (count - 1)) * 84,
    y: 84 - ((value - min) / range) * 68,
  });

  return (
    <div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 100 100" className="min-h-64 min-w-[520px] overflow-visible" role="img" aria-label="Trend chart">
          {[16, 33, 50, 67, 84].map((y) => <line key={y} x1="8" x2="92" y1={y} y2={y} stroke="#e7e5e4" strokeWidth=".4" />)}
          {series.map(({ label, color, values }) => {
            const points = values.map((value, index) => point(value, index, values.length));
            return (
              <g key={label}>
                <polyline
                  points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {points.map(({ x, y }, index) => (
                  <g key={`${label}-${labels[index]}`}>
                    <circle cx={x} cy={y} r="2.2" fill={color} stroke="white" strokeWidth="1" />
                    <title>{`${label}, ${labels[index]}: ${valueFormatter(values[index])}`}</title>
                  </g>
                ))}
              </g>
            );
          })}
          {labels.map((label, index) => {
            const { x } = point(0, index, labels.length);
            return <text key={label} x={x} y="96" textAnchor="middle" className="fill-stone-500 text-[3.5px]">{label}</text>;
          })}
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        {series.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

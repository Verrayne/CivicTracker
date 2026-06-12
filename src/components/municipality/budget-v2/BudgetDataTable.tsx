import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";

export interface BudgetTableRow {
  id: string;
  label: string;
  amount: number;
  percentage?: number;
  meta?: string;
}

export function BudgetDataTable({
  rows,
  labelHeading,
  valueFormatter,
  onRowClick,
}: {
  rows: BudgetTableRow[];
  labelHeading: string;
  valueFormatter: (value: number) => string;
  onRowClick?: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [descending, setDescending] = useState(true);
  const filtered = useMemo(() => rows
    .filter(({ label, meta }) => `${label} ${meta || ""}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => descending ? b.amount - a.amount : a.amount - b.amount), [rows, query, descending]);

  return (
    <div>
      <label className="relative block max-w-sm">
        <span className="sr-only">Search table</span>
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
        <input
          className="min-h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm outline-none transition focus:border-civic-500 focus:ring-2 focus:ring-civic-100"
          placeholder={`Search ${labelHeading.toLowerCase()}...`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b text-xs uppercase tracking-wider text-stone-400">
            <tr>
              <th className="pb-3">{labelHeading}</th>
              <th className="pb-3">Details</th>
              <th className="pb-3 text-right">
                <button className="ml-auto flex items-center gap-1 font-bold" onClick={() => setDescending((value) => !value)}>
                  Amount <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="pb-3 text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((row) => (
              <tr
                key={row.id}
                className={onRowClick ? "cursor-pointer transition hover:bg-civic-50" : ""}
                onClick={() => onRowClick?.(row.id)}
              >
                <td className="py-4 pr-4 font-semibold text-civic-950">{row.label}</td>
                <td className="py-4 pr-4 text-stone-500">{row.meta || "—"}</td>
                <td className="py-4 text-right font-semibold text-stone-700">{valueFormatter(row.amount)}</td>
                <td className="py-4 text-right text-stone-500">{row.percentage === undefined ? "—" : `${row.percentage.toFixed(1)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="py-8 text-center text-sm text-stone-500">No matching results.</p>}
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import type { BudgetV2Fact } from "../../../types";

const years = ["2025/26", "2026/27", "2027/28", "2028/29"];

export function HistoricalBudgetTable({
  facts,
  valueFormatter,
}: {
  facts: BudgetV2Fact[];
  valueFormatter: (value: number) => string;
}) {
  const [query, setQuery] = useState("");
  const [descending, setDescending] = useState(true);
  const rows = useMemo(() => {
    const grouped = new Map<string, BudgetV2Fact[]>();
    facts.forEach((fact) => grouped.set(fact.category, [...(grouped.get(fact.category) || []), fact]));
    return [...grouped.entries()]
      .map(([category, values]) => {
        const byYear = Object.fromEntries(values.map((value) => [value.financialYear, value.amount]));
        const previous = byYear["2025/26"] || 0;
        const current = byYear["2026/27"] || 0;
        return {
          category,
          byYear,
          growth: previous ? ((current - previous) / previous) * 100 : null,
          current,
        };
      })
      .filter(({ category }) => category.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => descending ? b.current - a.current : a.current - b.current);
  }, [facts, query, descending]);

  return (
    <div>
      <label className="relative block max-w-sm">
        <span className="sr-only">Search budget categories</span>
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
        <input
          className="min-h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm outline-none transition focus:border-civic-500 focus:ring-2 focus:ring-civic-100"
          placeholder="Search categories..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b text-xs uppercase tracking-wider text-stone-400">
            <tr>
              <th className="pb-3">Category</th>
              {years.map((year) => <th key={year} className="pb-3 text-right">{year}</th>)}
              <th className="pb-3 text-right">
                <button className="ml-auto flex items-center gap-1 font-bold" onClick={() => setDescending((value) => !value)}>
                  Growth <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.category}>
                <td className="py-4 pr-4 font-semibold text-civic-950">{row.category}</td>
                {years.map((year) => <td key={year} className="py-4 pl-4 text-right text-stone-600">{valueFormatter(row.byYear[year] || 0)}</td>)}
                <td className="py-4 pl-4 text-right font-bold text-stone-700">
                  {row.growth === null ? "New" : `${row.growth >= 0 ? "+" : ""}${row.growth.toFixed(1)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="py-8 text-center text-sm text-stone-500">No matching results.</p>}
      </div>
    </div>
  );
}

import type { MunicipalKpi } from "../../types";
import { cn } from "../../lib/utils";

export function KpiScorecard({ kpi }: { kpi: MunicipalKpi }) {
  const status = kpi.achievement_percentage >= 90 ? "green" : kpi.achievement_percentage >= 70 ? "amber" : "red";

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">{kpi.department_name}</p>
          <h3 className="mt-2 font-semibold leading-6 text-civic-950">{kpi.kpi_name}</h3>
        </div>
        <span className={cn(
          "rounded-full px-3 py-1 text-xs font-bold",
          status === "green" && "bg-emerald-100 text-emerald-800",
          status === "amber" && "bg-amber-100 text-amber-800",
          status === "red" && "bg-red-100 text-red-800",
        )}>
          {kpi.achievement_percentage.toFixed(0)}%
        </span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className={cn("h-full rounded-full", status === "green" && "bg-emerald-500", status === "amber" && "bg-amber-500", status === "red" && "bg-red-500")}
          style={{ width: `${Math.min(kpi.achievement_percentage, 100)}%` }}
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div><p className="text-stone-400">Target</p><p className="mt-1 font-bold text-stone-700">{kpi.target_value.toLocaleString("en-ZA")}</p></div>
        <div><p className="text-stone-400">Actual</p><p className="mt-1 font-bold text-stone-700">{kpi.actual_value.toLocaleString("en-ZA")}</p></div>
        <div><p className="text-stone-400">Period</p><p className="mt-1 font-bold text-stone-700">{kpi.reporting_period}</p></div>
      </div>
    </div>
  );
}

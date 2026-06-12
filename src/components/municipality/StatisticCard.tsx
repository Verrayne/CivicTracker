import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";

export function StatisticCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">{label}</p>
          <p className="mt-3 font-display text-3xl font-bold text-civic-950">{value}</p>
          {hint && <p className="mt-2 text-xs leading-5 text-stone-500">{hint}</p>}
        </div>
        {Icon && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-civic-50 text-civic-700"><Icon className="h-5 w-5" /></span>}
      </div>
    </Card>
  );
}

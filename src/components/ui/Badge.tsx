import type { IssueStatus } from "../../types";
import { cn } from "../../lib/utils";

const styles: Record<IssueStatus, string> = {
  Open: "bg-amber-100 text-amber-900",
  Reported: "bg-blue-100 text-blue-900",
  "In Progress": "bg-violet-100 text-violet-900",
  Resolved: "bg-emerald-100 text-emerald-900",
  Closed: "bg-stone-200 text-stone-700",
};

export function Badge({ status, className }: { status: IssueStatus; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", styles[status], className)}>
      {status}
    </span>
  );
}

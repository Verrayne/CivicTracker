import { Search } from "lucide-react";
import { ISSUE_STATUSES, type IssueStatus } from "../../types";
import { cn } from "../../lib/utils";

interface FilterBarProps {
  status: IssueStatus | "All";
  search: string;
  sort: string;
  onStatusChange: (value: IssueStatus | "All") => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: "newest" | "oldest" | "followups") => void;
}

export function FilterBar(props: FilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["All", ...ISSUE_STATUSES] as const).map((status) => (
          <button
            key={status}
            onClick={() => props.onStatusChange(status)}
            className={cn(
              "whitespace-nowrap rounded-full border bg-white px-4 py-2 text-xs font-bold text-stone-600 transition",
              props.status === status && "border-civic-900 bg-civic-900 text-white",
            )}
          >
            {status}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
        <label className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
          <input
            value={props.search}
            onChange={(event) => props.onSearchChange(event.target.value)}
            placeholder="Search number, address, title or description"
            className="min-h-11 w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-civic-600 focus:ring-2 focus:ring-civic-100"
          />
        </label>
        <select
          value={props.sort}
          onChange={(event) => props.onSortChange(event.target.value as "newest" | "oldest" | "followups")}
          className="min-h-11 rounded-lg border bg-white px-3 text-sm font-semibold outline-none focus:border-civic-600"
          aria-label="Sort reports"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="followups">Most follow-ups</option>
        </select>
      </div>
    </div>
  );
}

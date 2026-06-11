import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { FilterBar } from "../components/issues/FilterBar";
import { IssueCard } from "../components/issues/IssueCard";
import { EmptyState, ErrorState, LoadingSpinner } from "../components/feedback/States";
import { useIssues } from "../hooks/useIssues";
import { isSupabaseConfigured } from "../lib/supabase";
import type { IssueStatus } from "../types";

export function ReportsPage() {
  const [status, setStatus] = useState<IssueStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "followups">("newest");
  const deferredSearch = useDeferredValue(search);
  const query = useIssues({ status, search: deferredSearch, sort });

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Public register</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-civic-950 sm:text-5xl">Ward reports</h1>
          <p className="mt-3 max-w-xl text-stone-500">See what has been reported and follow each issue through to resolution.</p>
        </div>
        <Link to="/report" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-civic-900 px-5 text-sm font-bold text-white">
          <Plus className="h-4 w-4" /> New report
        </Link>
      </div>

      <div className="mt-10"><FilterBar status={status} search={search} sort={sort} onStatusChange={setStatus} onSearchChange={setSearch} onSortChange={setSort} /></div>

      {!isSupabaseConfigured ? (
        <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950">
          <strong>Connect Supabase to load reports.</strong> Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to a local `.env` file.
        </div>
      ) : query.isLoading ? (
        <LoadingSpinner />
      ) : query.isError ? (
        <div className="mt-8"><ErrorState message={query.error.message} retry={() => query.refetch()} /></div>
      ) : !query.data?.length ? (
        <div className="mt-8"><EmptyState /></div>
      ) : (
        <>
          <p className="mt-8 text-sm text-stone-500">{query.data.length} {query.data.length === 1 ? "report" : "reports"}</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {query.data.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
          </div>
        </>
      )}
    </div>
  );
}

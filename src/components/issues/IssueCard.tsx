import { format } from "date-fns";
import { ArrowUpRight, Camera, MapPin, MessageSquareMore } from "lucide-react";
import { Link } from "react-router-dom";
import type { Issue } from "../../types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden shadow-none transition hover:-translate-y-0.5 hover:shadow-card">
      {issue.issue_photos[0]?.public_url && (
        <img
          src={issue.issue_photos[0].public_url}
          alt=""
          className="h-44 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="font-mono text-xs font-bold tracking-wide text-civic-700">{issue.issue_number}</span>
          <Badge status={issue.status} />
        </div>
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-clay">{issue.issue_types?.name || "Other"}</p>
        <h2 className="font-display text-xl font-bold leading-tight text-civic-950">{issue.title}</h2>
        <p className="mt-3 flex items-start gap-2 text-sm text-stone-500">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          {issue.street_address}
        </p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <p className="text-xs text-stone-400">{format(new Date(issue.created_at), "d MMM yyyy")}</p>
            <div className="mt-2 flex gap-3 text-xs font-semibold text-stone-500">
              <span className="flex items-center gap-1"><MessageSquareMore className="h-3.5 w-3.5" />{issue.followup_count}</span>
              <span className="flex items-center gap-1"><Camera className="h-3.5 w-3.5" />{issue.issue_photos.length}</span>
            </div>
          </div>
          <Link
            to={`/reports/${issue.issue_number}`}
            className="grid h-10 w-10 place-items-center rounded-full bg-civic-50 text-civic-900 transition group-hover:bg-civic-900 group-hover:text-white"
            aria-label={`View ${issue.issue_number}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

import { format } from "date-fns";
import { ArrowLeft, CalendarDays, ExternalLink, MapPin, MessageSquareMore } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ErrorState, LoadingSpinner } from "../components/feedback/States";
import { PhotoGallery } from "../components/issues/PhotoGallery";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useIssue } from "../hooks/useIssues";
import { ISSUE_STATUSES } from "../types";

export function IssueDetailPage() {
  const { issueNumber = "" } = useParams();
  const query = useIssue(issueNumber);

  if (query.isLoading) return <LoadingSpinner label="Loading issue..." />;
  if (query.isError || !query.data) return <div className="mx-auto max-w-4xl px-5 py-16"><ErrorState message="This issue could not be found." /></div>;

  const issue = query.data;
  const currentIndex = ISSUE_STATUSES.indexOf(issue.status);
  const mapsUrl = issue.latitude != null && issue.longitude != null
    ? `https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(issue.street_address)}`;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16">
      <Link to="/reports" className="inline-flex items-center gap-2 text-sm font-bold text-civic-800 hover:text-civic-950"><ArrowLeft className="h-4 w-4" /> Back to reports</Link>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-sm font-bold tracking-wider text-civic-700">{issue.issue_number}</span>
              <Badge status={issue.status} />
            </div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-clay">{issue.issue_types?.name}</p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-civic-950">{issue.title}</h1>
            <p className="mt-6 whitespace-pre-wrap leading-7 text-stone-600">{issue.description}</p>
          </Card>
          {issue.issue_photos.length > 0 && <Card className="p-5"><PhotoGallery photos={issue.issue_photos} /></Card>}
          <Card className="p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-civic-950">Progress</h2>
            <div className="mt-7 space-y-0">
              {ISSUE_STATUSES.map((status, index) => (
                <div key={status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={`h-4 w-4 rounded-full border-2 ${index <= currentIndex ? "border-civic-700 bg-civic-700" : "border-stone-300 bg-white"}`} />
                    {index < ISSUE_STATUSES.length - 1 && <span className={`h-10 w-0.5 ${index < currentIndex ? "bg-civic-700" : "bg-stone-200"}`} />}
                  </div>
                  <p className={`-mt-1 text-sm font-semibold ${index <= currentIndex ? "text-civic-950" : "text-stone-400"}`}>{status}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold text-civic-950">Location</h2>
            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-stone-600"><MapPin className="mt-1 h-4 w-4 shrink-0 text-clay" />{issue.street_address}</p>
            {issue.nearest_intersection && <p className="mt-2 pl-6 text-xs text-stone-500">Near {issue.nearest_intersection}</p>}
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-civic-800 hover:underline">Open in Google Maps <ExternalLink className="h-3.5 w-3.5" /></a>
          </Card>
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold text-civic-950">Report details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-stone-400" /><div><dt className="text-xs text-stone-400">Reported</dt><dd className="font-semibold">{format(new Date(issue.created_at), "d MMMM yyyy")}</dd></div></div>
              <div className="flex items-center gap-3"><MessageSquareMore className="h-4 w-4 text-stone-400" /><div><dt className="text-xs text-stone-400">Follow-ups sent</dt><dd className="font-semibold">{issue.followup_count}</dd></div></div>
              {issue.reference_number && <div><dt className="text-xs text-stone-400">Municipal reference</dt><dd className="mt-1 font-mono font-semibold">{issue.reference_number}</dd></div>}
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}

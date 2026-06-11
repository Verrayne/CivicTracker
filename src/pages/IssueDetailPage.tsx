import { format } from "date-fns";
import { ArrowLeft, CalendarDays, ExternalLink, Mail, MapPin, MessageSquareMore } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ErrorState, LoadingSpinner } from "../components/feedback/States";
import { PhotoGallery } from "../components/issues/PhotoGallery";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useIssue } from "../hooks/useIssues";
import { ISSUE_STATUSES } from "../types";

function emailBodyToText(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  return document.body.textContent?.trim() || "";
}

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
      <Card className="mt-8 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-civic-950">Progress</h2>
          <Badge status={issue.status} />
        </div>
        <ol className="mt-7 flex w-full">
          {ISSUE_STATUSES.map((status, index) => (
            <li key={status} className="relative flex flex-1 flex-col items-center text-center">
              {index > 0 && (
                <span className={`absolute right-1/2 top-2 h-0.5 w-full ${index <= currentIndex ? "bg-civic-700" : "bg-stone-200"}`} />
              )}
              <span className={`relative z-10 h-4 w-4 rounded-full border-2 ${index <= currentIndex ? "border-civic-700 bg-civic-700" : "border-stone-300 bg-white"}`} />
              <span className={`mt-3 text-[10px] font-bold sm:text-xs ${index <= currentIndex ? "text-civic-950" : "text-stone-400"}`}>{status}</span>
            </li>
          ))}
        </ol>
      </Card>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
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
          {issue.issue_photos.length > 0 && (
            <Card className="p-5 sm:p-6">
              <h2 className="mb-5 font-display text-2xl font-bold text-civic-950">Media</h2>
              <PhotoGallery photos={issue.issue_photos} />
            </Card>
          )}
          {issue.communications?.map((communication) => (
            <Card key={communication.id} className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-civic-50 text-civic-800"><Mail className="h-5 w-5" /></span>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-civic-950">Municipality email</h2>
                    <p className="text-xs text-stone-500">To {communication.recipient_email}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  communication.delivery_status === "sent"
                    ? "bg-emerald-100 text-emerald-900"
                    : communication.delivery_status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-900"
                }`}>
                  {communication.delivery_status}
                </span>
              </div>
              <div className="mt-6 border-t pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Subject</p>
                <p className="mt-1 break-words font-semibold text-stone-800">{communication.subject}</p>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-stone-600 [overflow-wrap:anywhere]">{emailBodyToText(communication.body)}</p>
              </div>
            </Card>
          ))}
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

import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "../ui/Button";

export function LoadingSpinner({ label = "Loading reports..." }: { label?: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-stone-500">
      <LoaderCircle className="h-7 w-7 animate-spin text-civic-700" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <AlertCircle className="h-7 w-7 text-red-700" />
      <p className="max-w-md text-sm text-red-900">{message}</p>
      {retry && <Button onClick={retry}>Try again</Button>}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-white/60 p-8 text-center">
      <Inbox className="h-8 w-8 text-civic-700" />
      <h2 className="font-display text-xl font-bold text-civic-950">No reports found</h2>
      <p className="max-w-sm text-sm text-stone-500">Try changing the filters or search terms.</p>
    </div>
  );
}

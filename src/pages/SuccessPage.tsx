import { Check, Clipboard, List } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

export function SuccessPage() {
  const { issueNumber } = useParams();
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    await navigator.clipboard.writeText(issueNumber || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="paper-grid grid min-h-[calc(100vh-180px)] place-items-center px-5 py-16">
      <div className="w-full max-w-xl rounded-3xl border bg-white p-8 text-center shadow-card sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Check className="h-8 w-8" /></span>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-clay">Report received</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-civic-950">Thank you for speaking up.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-stone-500">Your issue has been logged. Keep this public issue number to track its progress.</p>
        <button onClick={copyNumber} className="mx-auto mt-7 flex items-center gap-3 rounded-xl bg-civic-50 px-5 py-4 font-mono text-lg font-bold text-civic-950">
          {issueNumber} {copied ? <Check className="h-4 w-4 text-emerald-700" /> : <Clipboard className="h-4 w-4 text-civic-600" />}
        </button>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={`/reports/${issueNumber}`} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-civic-900 px-5 text-sm font-bold text-white">View this report</Link>
          <Link to="/reports" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-civic-900 px-5 text-sm font-bold text-civic-900"><List className="h-4 w-4" /> All reports</Link>
        </div>
      </div>
    </div>
  );
}

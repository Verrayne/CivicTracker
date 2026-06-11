import { ArrowRight, CheckCircle2, ClipboardList, MapPinned, Send } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  { icon: ClipboardList, number: "01", title: "Tell us what happened", text: "Add the location, issue details and up to five photos." },
  { icon: Send, number: "02", title: "We route the report", text: "Your issue is logged and sent to the relevant municipal channel." },
  { icon: CheckCircle2, number: "03", title: "Track it publicly", text: "Use your issue number to follow status changes and follow-ups." },
];

export function HomePage() {
  return (
    <>
      <section className="paper-grid relative overflow-hidden border-b border-civic-900/10">
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
          <div className="relative z-10">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-civic-900/15 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-civic-800">
              <span className="h-2 w-2 rounded-full bg-clay" />
              Built for Ward 47, Tshwane
            </p>
            <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.02] tracking-tight text-civic-950 sm:text-6xl lg:text-7xl">
              A better ward starts with being <span className="italic text-clay">heard.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-stone-600">
              Report potholes, water leaks, broken streetlights and other municipal issues. Get a public reference and track progress in one place.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/report" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-civic-900 px-6 py-3 text-sm font-bold text-white hover:bg-civic-800">
                Report an issue <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/reports" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-civic-900 px-6 py-3 text-sm font-bold text-civic-950 hover:bg-white">
                View public reports
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 rotate-3 rounded-[2.5rem] bg-civic-100" />
            <div className="relative overflow-hidden rounded-[2rem] bg-civic-900 p-8 text-white shadow-2xl sm:p-10">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[35px] border-civic-700/50" />
              <MapPinned className="h-12 w-12 text-civic-300" />
              <p className="mt-14 font-mono text-sm font-bold tracking-widest text-civic-300">W47-2026-000123</p>
              <h2 className="mt-3 font-display text-3xl font-bold">Streetlight not working</h2>
              <p className="mt-3 text-sm leading-6 text-civic-200">Lancia Street near the community park</p>
              <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-5">
                <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-amber-950">Reported</span>
                <span className="text-xs text-civic-300">Updated today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Simple by design</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-civic-950">From street to service desk</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, number, title, text }) => (
            <div key={number} className="rounded-2xl border bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-civic-50 text-civic-800"><Icon className="h-5 w-5" /></span>
                <span className="font-display text-3xl font-bold text-stone-200">{number}</span>
              </div>
              <h3 className="mt-7 font-display text-xl font-bold text-civic-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

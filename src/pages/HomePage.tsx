import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Banknote, CheckCircle2, ClipboardList, Facebook, Globe, Instagram, Mail, MapPinned, MessageCircle, PieChart, Send, Users } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Dropdown } from "../components/ui/Dropdown";
import { useMunicipality } from "../context/municipality";
import { useLatestIssue } from "../hooks/useIssues";
import { useReferenceData } from "../hooks/useIssues";

const steps = [
  { icon: ClipboardList, number: "01", title: "Tell us what happened", text: "Add the location, issue details and up to five photos." },
  { icon: Send, number: "02", title: "We route the report", text: "Your issue is logged and sent to the relevant municipal channel." },
  { icon: CheckCircle2, number: "03", title: "Track it publicly", text: "Use your issue number to follow status changes and follow-ups." },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14.5 3c.3 2.5 1.7 4 4.5 4.2v3.1a9.2 9.2 0 0 1-4.5-1.4v6.2a6.1 6.1 0 1 1-5.3-6v3.2a3 3 0 1 0 2.1 2.8V3h3.2Z" />
    </svg>
  );
}

function ProfileIcon({ href, label, children }: { href: string | null | undefined; label: string; children: ReactNode }) {
  const className = `grid h-10 w-10 place-items-center rounded-full border transition ${
    href
      ? "border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
      : "cursor-not-allowed border-white/5 bg-white/5 text-white/25"
  }`;

  if (!href) return <span className={className} aria-label={`${label} unavailable`} title={`${label} unavailable`}>{children}</span>;
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
      {children}
    </a>
  );
}

function whatsappUrl(mobile: string) {
  let digits = mobile.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `27${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

export function HomePage() {
  const latestIssueQuery = useLatestIssue();
  const latestIssue = latestIssueQuery.data;
  const { wards } = useReferenceData();
  const { selectedMunicipality, selectedMunicipalityId } = useMunicipality();
  const municipalityWards = useMemo(
    () => (wards.data || []).filter((ward) => ward.municipality_id === selectedMunicipalityId),
    [wards.data, selectedMunicipalityId],
  );
  const [selectedWardId, setSelectedWardId] = useState("");

  useEffect(() => {
    if (!municipalityWards.some(({ id }) => id === selectedWardId)) {
      setSelectedWardId(municipalityWards[0]?.id || "");
    }
  }, [municipalityWards, selectedWardId]);

  const selectedWard = municipalityWards.find(({ id }) => id === selectedWardId);

  return (
    <>
      <section className="paper-grid relative overflow-hidden border-b border-civic-900/10">
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
          <div className="relative z-10">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-civic-900/15 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-civic-800">
              <span className="h-2 w-2 rounded-full bg-clay" />
              Currently in testing
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
                View all issues
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 rotate-3 rounded-[2.5rem] bg-civic-100" />
            <Link
              to={latestIssue ? `/reports/${latestIssue.issue_number}` : "/reports"}
              className="relative block overflow-hidden rounded-[2rem] bg-civic-900 p-8 text-white shadow-2xl transition hover:-translate-y-1 sm:p-10"
            >
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[35px] border-civic-700/50" />
              <MapPinned className="h-12 w-12 text-civic-300" />
              <p className="mt-14 font-mono text-sm font-bold tracking-widest text-civic-300">
                {latestIssue?.issue_number || "LATEST WARD ISSUE"}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold">
                {latestIssue?.title || (latestIssueQuery.isLoading ? "Loading latest issue..." : "No issues logged yet")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-civic-200">
                {latestIssue?.street_address || "New reports will appear here as they are logged."}
              </p>
              <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-5">
                {latestIssue ? <Badge status={latestIssue.status} /> : <span />}
                <span className="text-xs text-civic-300">
                  {latestIssue ? `Updated ${formatDistanceToNow(new Date(latestIssue.updated_at), { addSuffix: true })}` : "View all issues"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-civic-900/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_.9fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Know your representative</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl font-bold text-civic-950">Find your ward councillor</h2>
            <p className="mt-4 max-w-2xl leading-7 text-stone-600">
              Your ward councillor represents local residents in the municipal council and helps make sure community concerns reach the right people.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Raise and follow up on service delivery problems.",
                "Represent your ward in council decisions.",
                "Share local notices, meetings and planned disruptions.",
                "Escalate municipal matters that remain unresolved.",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-parchment p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-civic-700" />
                  <p className="text-sm leading-6 text-stone-600">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-stone-500">
              For emergencies or immediate danger, contact the relevant emergency service rather than your ward councillor.
            </p>
          </div>

          <div className="rounded-3xl bg-civic-950 p-6 text-white shadow-xl sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-civic-200"><Users className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-civic-300">{selectedMunicipality?.name || "Municipality"}</p>
                <h3 className="font-display text-2xl font-bold">Ward lookup</h3>
              </div>
            </div>
            <div className="mt-6">
              <p className="mb-1.5 text-sm font-semibold text-civic-100">Select your ward</p>
              <Dropdown
                ariaLabel="Select your ward"
                variant="dark"
                searchable
                searchPlaceholder="Type your ward number"
                value={selectedWardId}
                onChange={setSelectedWardId}
                options={
                  municipalityWards.length
                    ? municipalityWards.map(({ id, name }) => ({ value: id, label: name }))
                    : [{ value: "", label: "No wards available yet" }]
                }
              />
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-civic-300">Ward councillor</p>
              <p className="mt-2 font-display text-2xl font-bold">{selectedWard?.councillor_name || "Details being updated"}</p>
              <div className="mt-5 space-y-3 text-sm">
                {selectedWard?.councillor_email ? (
                  <a className="flex items-center gap-3 text-civic-100 hover:text-white" href={`mailto:${selectedWard.councillor_email}`}>
                    <Mail className="h-4 w-4 text-civic-300" /> {selectedWard.councillor_email}
                  </a>
                ) : <p className="text-civic-300">Email not available</p>}
                {selectedWard?.councillor_mobile ? (
                  <a className="flex items-center gap-3 text-civic-100 hover:text-white" href={whatsappUrl(selectedWard.councillor_mobile)} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4 text-civic-300" /> {selectedWard.councillor_mobile}
                  </a>
                ) : <p className="text-civic-300">Mobile number not available</p>}
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-5">
                <ProfileIcon href={selectedWard?.councillor_website_url} label="Councillor website">
                  <Globe className="h-4 w-4" />
                </ProfileIcon>
                <ProfileIcon href={selectedWard?.councillor_instagram_url} label="Councillor Instagram">
                  <Instagram className="h-4 w-4" />
                </ProfileIcon>
                <ProfileIcon href={selectedWard?.councillor_tiktok_url} label="Councillor TikTok">
                  <TikTokIcon className="h-4 w-4" />
                </ProfileIcon>
                <ProfileIcon href={selectedWard?.councillor_facebook_url} label="Councillor Facebook">
                  <Facebook className="h-4 w-4" />
                </ProfileIcon>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-civic-900/10 bg-civic-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1fr_.85fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic-300">Make the budget personal</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold">See where your municipal rates actually go</h2>
            <p className="mt-4 max-w-2xl leading-7 text-civic-200">
              Turn your monthly rates amount into a simple breakdown of the services and infrastructure your contribution helps fund.
            </p>
            <Link
              to="/municipality/where-your-money-goes"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-civic-950 transition hover:bg-civic-50"
            >
              Calculate my contribution <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Banknote className="h-7 w-7 text-civic-300" />
              <p className="mt-6 text-sm text-civic-200">Example monthly rates</p>
              <p className="mt-1 font-display text-3xl font-bold">R2,500</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <PieChart className="h-7 w-7 text-clay" />
              <p className="mt-6 text-sm text-civic-200">Annual contribution</p>
              <p className="mt-1 font-display text-3xl font-bold">R30,000</p>
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

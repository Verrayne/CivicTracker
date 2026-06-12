import { Mail, X } from "lucide-react";
import { useEffect } from "react";
import type { MunicipalOfficial } from "../../types";

export function OfficialProfileDrawer({ official, onClose }: { official: MunicipalOfficial | null; onClose: () => void }) {
  useEffect(() => {
    if (!official) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [official, onClose]);

  if (!official) return null;
  const initials = official.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${official.full_name} profile`}>
      <button className="absolute inset-0 bg-civic-950/60" onClick={onClose} aria-label="Close profile" />
      <aside className="absolute inset-y-0 right-0 w-full max-w-lg overflow-y-auto bg-parchment p-6 shadow-2xl sm:p-8">
        <button onClick={onClose} className="ml-auto grid h-10 w-10 place-items-center rounded-full border bg-white" aria-label="Close profile">
          <X className="h-5 w-5" />
        </button>
        <div className="mt-8">
          {official.profile_image_url ? (
            <img src={official.profile_image_url} alt="" className="h-24 w-24 rounded-2xl object-cover" />
          ) : (
            <span className="grid h-24 w-24 place-items-center rounded-2xl bg-civic-900 font-display text-3xl font-bold text-white">{initials}</span>
          )}
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-clay">{official.municipal_departments?.name}</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-civic-950">{official.full_name}</h2>
          <p className="mt-2 font-semibold text-stone-600">{official.position}</p>
        </div>
        <div className="mt-8 space-y-7">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Biography</h3>
            <p className="mt-3 text-sm leading-7 text-stone-600">{official.bio || "Biography not yet available."}</p>
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Responsibilities</h3>
            <p className="mt-3 text-sm leading-7 text-stone-600">{official.responsibilities || "Responsibilities not yet available."}</p>
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Contact information</h3>
            {official.email ? (
              <a href={`mailto:${official.email}`} className="mt-3 flex items-center gap-3 rounded-xl bg-white p-4 text-sm font-semibold text-civic-800">
                <Mail className="h-4 w-4" /> {official.email}
              </a>
            ) : <p className="mt-3 text-sm text-stone-500">Contact details not available.</p>}
          </section>
        </div>
      </aside>
    </div>
  );
}

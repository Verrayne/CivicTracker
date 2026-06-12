import { Mail } from "lucide-react";
import type { MunicipalOfficial } from "../../types";

export function OrganogramNode({ official, onClick }: { official: MunicipalOfficial; onClick: () => void }) {
  const initials = official.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border bg-white p-5 text-left shadow-card transition hover:-translate-y-1 hover:border-civic-300"
    >
      <div className="flex items-start gap-4">
        {official.profile_image_url ? (
          <img src={official.profile_image_url} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-civic-100 font-bold text-civic-800">{initials}</span>
        )}
        <div className="min-w-0">
          <p className="font-display text-lg font-bold text-civic-950">{official.full_name}</p>
          <p className="mt-1 text-sm font-semibold text-clay">{official.position}</p>
          <p className="mt-2 text-xs text-stone-500">{official.municipal_departments?.name}</p>
          {official.email && <p className="mt-3 flex items-center gap-2 truncate text-xs text-stone-500"><Mail className="h-3.5 w-3.5" /> {official.email}</p>}
        </div>
      </div>
    </button>
  );
}

import { ExternalLink, MapPin, X } from "lucide-react";
import type { CapitalProject } from "../../../types";
import { Button } from "../../ui/Button";

export function CapitalProjectDrawer({
  project,
  onClose,
  money,
}: {
  project: CapitalProject | null;
  onClose: () => void;
  money: (value: number) => string;
}) {
  if (!project) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-civic-950/50" role="presentation" onMouseDown={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-parchment p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="ml-auto grid h-10 w-10 place-items-center rounded-full hover:bg-stone-200" onClick={onClose} aria-label="Close project details">
          <X className="h-5 w-5" />
        </button>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-clay">{project.department || "Capital project"}</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-civic-950">{project.name}</h2>
        <p className="mt-6 text-4xl font-bold text-civic-800">{money(project.budgetAmount)}</p>
        <p className="mt-2 text-sm text-stone-500">{project.financialYear} budget · {project.status}</p>
        {project.location && <p className="mt-8 flex items-start gap-2 text-sm text-stone-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{project.location}</p>}
        {project.description && <p className="mt-6 leading-7 text-stone-700">{project.description}</p>}
        {project.sourceUrl && (
          <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="mt-8 inline-block">
            <Button><ExternalLink className="h-4 w-4" /> Open source document</Button>
          </a>
        )}
      </aside>
    </div>
  );
}

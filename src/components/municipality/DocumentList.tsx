import { Download, FileText } from "lucide-react";
import type { MunicipalBudgetDocument } from "../../types";

export function DocumentList({ documents }: { documents: MunicipalBudgetDocument[] }) {
  return (
    <div className="divide-y divide-stone-100">
      {documents.map((document) => (
        <a
          key={document.id}
          href={document.document_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:text-civic-700"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-civic-50 text-civic-700"><FileText className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-civic-950">{document.title}</p>
            <p className="mt-1 text-xs text-stone-500">Financial year {document.financial_year}</p>
          </div>
          <Download className="h-4 w-4 shrink-0 text-stone-400" />
        </a>
      ))}
    </div>
  );
}

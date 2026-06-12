import type { ReactNode } from "react";
import { Card } from "../ui/Card";

export function ChartCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-stone-100 px-5 py-5 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-civic-950">{title}</h2>
        {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </Card>
  );
}

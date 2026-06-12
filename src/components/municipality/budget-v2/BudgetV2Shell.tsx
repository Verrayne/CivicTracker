import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { MunicipalityShell } from "../MunicipalityShell";

const tabs = [
  { to: "/municipality/budget-v2/revenue", label: "Revenue" },
  { to: "/municipality/budget-v2/expenditure", label: "Expenditure" },
  { to: "/municipality/budget-v2/capital", label: "Capital budget" },
];

export function BudgetV2Shell({ children }: { children: ReactNode }) {
  return (
    <MunicipalityShell
      title="Budget 2.0"
      description="Explore Tshwane's revenue, operating expenditure and capital programme with detailed, source-linked figures."
    >
      <nav className="mb-8 flex w-full gap-2 overflow-x-auto rounded-2xl border bg-white p-2 shadow-card" aria-label="Budget 2.0 sections">
        {tabs.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              "min-h-11 flex-1 whitespace-nowrap rounded-xl px-5 py-3 text-center text-sm font-bold text-stone-500 transition hover:bg-civic-50 hover:text-civic-900",
              isActive && "bg-civic-900 text-white hover:bg-civic-900 hover:text-white",
            )}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      {children}
    </MunicipalityShell>
  );
}

export function BudgetSource({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <p className="mt-8 text-xs leading-5 text-stone-500">
      Source: City of Tshwane 2026/27 MTREF.{" "}
      <a className="font-semibold text-civic-700 underline underline-offset-2" href={url} target="_blank" rel="noreferrer">
        Open source document
      </a>
    </p>
  );
}

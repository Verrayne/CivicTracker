import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Building2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useMunicipality } from "../../context/municipality";

const tabs = [
  { to: "/municipality", label: "Overview", end: true },
  { to: "/municipality/budget", label: "Budget" },
  { to: "/municipality/budget-v2", label: "Budget 2.0" },
  { to: "/municipality/management", label: "Management" },
  { to: "/municipality/performance", label: "Performance" },
  { to: "/municipality/where-your-money-goes", label: "Where Your Money Goes" },
];

export function MunicipalityShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { selectedMunicipality } = useMunicipality();

  return (
    <div>
      <section className="border-b border-civic-900/10 bg-civic-950 text-white">
        <div className="mx-auto max-w-7xl px-5 pb-0 pt-12 lg:px-8 lg:pt-16">
          <div className="flex items-center gap-3 text-civic-300">
            <Building2 className="h-5 w-5" />
            <p className="text-xs font-bold uppercase tracking-[0.18em]">
              {selectedMunicipality?.name || "Municipality"}
            </p>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-civic-200">{description}</p>
          <nav className="mt-10 flex gap-1 overflow-x-auto" aria-label="Municipality sections">
            {tabs.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-t-xl px-4 py-3 text-sm font-semibold text-civic-200 transition hover:bg-white/10 hover:text-white",
                    isActive && "bg-parchment text-civic-950 hover:bg-parchment hover:text-civic-950",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">{children}</div>
    </div>
  );
}

export function SampleDataNotice() {
  return (
    <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
      Demonstration municipal data is shown for this first release. WardWorks issue statistics are calculated from live reports.
    </div>
  );
}

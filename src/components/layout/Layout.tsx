import { Link, NavLink, Outlet } from "react-router-dom";
import { MapPin, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/reports", label: "View reports" },
  { to: "/report", label: "Report an issue" },
];

export function Layout() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = "WardWorks";
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-civic-900/10 bg-parchment/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-civic-900 text-white">
              <MapPin className="h-5 w-5" />
            </span>
            <strong className="font-display text-xl leading-none text-civic-950">WardWorks</strong>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-civic-900",
                    isActive && "bg-white text-civic-900 shadow-sm",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="border-t bg-parchment px-5 py-3 md:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-semibold text-stone-700 hover:bg-white"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-civic-900/10 bg-civic-950 py-8 text-civic-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>WardWorks © 2026</p>
          <p className="text-civic-300">Community reports are public. Do not include sensitive information.</p>
        </div>
      </footer>
    </div>
  );
}

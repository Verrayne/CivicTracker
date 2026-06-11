import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  ariaLabel: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  eyebrow?: string;
  variant?: "light" | "dark";
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  ariaLabel,
  options,
  value,
  onChange,
  disabled = false,
  eyebrow,
  variant = "light",
  align = "left",
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-left transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
          variant === "dark"
            ? "border-white/15 bg-white text-civic-950 hover:bg-civic-50 focus:ring-civic-300"
            : "border-civic-900/10 bg-white text-civic-950 shadow-sm hover:border-civic-900/20 focus:ring-civic-100",
        )}
      >
        <span className="min-w-0">
          {eyebrow && <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">{eyebrow}</span>}
          <span className="text-sm font-bold">{selected?.label || "Select"}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute top-[calc(100%+0.5rem)] z-50 min-w-full overflow-hidden rounded-xl border border-civic-900/10 bg-white p-1.5 text-civic-950 shadow-xl",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-4 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-civic-50",
                  isSelected && "bg-civic-50 text-civic-900",
                )}
              >
                {option.label}
                {isSelected && <Check className="h-4 w-4 text-civic-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

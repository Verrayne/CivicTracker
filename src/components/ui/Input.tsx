import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <label className="block" htmlFor={inputId}>
        {label && <span className="mb-1.5 block text-sm font-semibold text-stone-800">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "min-h-11 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-civic-600 focus:ring-2 focus:ring-civic-100 disabled:bg-stone-100",
            error && "border-red-500 focus:border-red-500 focus:ring-red-100",
            className,
          )}
          {...props}
        />
        {(error || hint) && (
          <span className={cn("mt-1.5 block text-xs", error ? "text-red-700" : "text-stone-500")}>
            {error || hint}
          </span>
        )}
      </label>
    );
  },
);
Input.displayName = "Input";

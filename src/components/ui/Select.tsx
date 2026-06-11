import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <label className="block" htmlFor={selectId}>
        {label && <span className="mb-1.5 block text-sm font-semibold text-stone-800">{label}</span>}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "min-h-11 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-civic-600 focus:ring-2 focus:ring-civic-100",
            error && "border-red-500",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="mt-1.5 block text-xs text-red-700">{error}</span>}
      </label>
    );
  },
);
Select.displayName = "Select";

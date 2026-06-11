import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || props.name;
    return (
      <label className="block" htmlFor={textareaId}>
        {label && <span className="mb-1.5 block text-sm font-semibold text-stone-800">{label}</span>}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-civic-600 focus:ring-2 focus:ring-civic-100",
            error && "border-red-500",
            className,
          )}
          {...props}
        />
        {error && <span className="mt-1.5 block text-xs text-red-700">{error}</span>}
      </label>
    );
  },
);
Textarea.displayName = "Textarea";

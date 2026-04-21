import { forwardRef, useId } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";

/**
 * DS InputField. Handoff README §9:
 *  label    : mono 11px uppercase ink-500 (через typeClass("label"))
 *  input    : 13.5px, padding 10/12, radius 8, border ink-300, bg paper-card
 *  focus    : border ink-900 (handoff), ring 3px ruby-bg (доп. по §accessibility)
 *  error    : ruby border + ruby helper text
 *  suffix   : опциональный слот справа внутри поля (икона или символ)
 */
export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  suffix?: React.ReactNode;
  wrapperClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      hint,
      error,
      suffix,
      id: providedId,
      className,
      wrapperClassName,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const hasError = Boolean(error);

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label htmlFor={id} className={cn(typeClass("label"), "text-ink-500")}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            className={cn(
              "w-full font-ds-sans text-[13.5px] text-ink-900 bg-paper-card",
              "border border-ink-300 rounded-ds-md outline-none",
              "px-3 py-2.5 transition-colors",
              "placeholder:text-ink-400",
              "focus:border-ink-900 focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
              hasError &&
                "border-ruby focus:border-ruby focus-visible:ring-ruby-bg",
              disabled && "opacity-60 cursor-not-allowed",
              suffix && "pr-10",
              className,
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-500 pointer-events-none">
              {suffix}
            </div>
          )}
        </div>
        {error ? (
          <div className={cn(typeClass("caption"), "text-ruby")}>{error}</div>
        ) : hint ? (
          <div className={cn(typeClass("caption"), "text-ink-500")}>{hint}</div>
        ) : null}
      </div>
    );
  },
);
InputField.displayName = "InputField";

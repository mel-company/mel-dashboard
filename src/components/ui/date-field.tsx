import { useId, useRef } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A themed date field. A bare `<input type="date">` shows the browser's own
 * `mm/dd/yyyy` placeholder and chrome — US order, Latin text, unstyled —
 * inside an Arabic RTL form. Figma draws `24/10/2026` with a calendar icon,
 * so the native control stays for the picker and keyboard support but is
 * made transparent, with the formatted value painted over it.
 */
const DateField = ({
  value,
  onChange,
  disabled,
  id,
  "aria-label": ariaLabel,
  placeholder = "يوم/شهر/سنة",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  placeholder?: string;
  className?: string;
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const ref = useRef<HTMLInputElement>(null);

  const display = value
    ? (() => {
        const [y, m, d] = value.split("-");
        return d && m && y ? `${d}/${m}/${y}` : value;
      })()
    : "";

  return (
    <div
      className={cn(
        "relative flex h-12 items-center rounded-[14px] border px-3",
        "border-[#e7edf6] bg-white",
        "dark:border-0 dark:bg-[#0a0e27]/80",
        "focus-within:ring-2 focus-within:ring-[#00b7ff]/30",
        disabled && "opacity-50",
        className,
      )}
    >
      <Calendar
        aria-hidden
        className="pointer-events-none me-2 size-5 shrink-0 text-slate-400 dark:text-[#e4e7fc]/30"
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none flex-1 text-right text-sm tabular-nums",
          display
            ? "text-slate-900 dark:text-[#e4e7fc]"
            : "text-slate-400 dark:text-[#4a5596]",
        )}
        dir="ltr"
      >
        {display || placeholder}
      </span>
      <input
        ref={ref}
        id={inputId}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
        // Native control stays focusable and operable; only its paint is hidden.
        className="absolute inset-0 size-full cursor-pointer rounded-[14px] bg-transparent text-transparent opacity-0 outline-none"
      />
    </div>
  );
};

export default DateField;

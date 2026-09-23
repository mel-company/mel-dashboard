import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { cn } from "@/lib/utils";
import { AiWebBrowsingIcon, Blockchain02Icon, Link01Icon, } from "@hugeicons-pro/core-twotone-rounded";

export type DomainPath = "subdomain" | "buy" | "owned";

const PATHS: {
  id: DomainPath;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}[] = [
    {
      id: "subdomain",
      title: "دومين فرعي",
      subtitle: "example.mel.iq",
      icon: <HugeiconsIcon icon={Blockchain02Icon} size={28} />,
    },
    {
      id: "buy",
      title: "شراء نطاق",
      subtitle: "دومين مخصص لمتجرك",
      icon: <HugeiconsIcon icon={AiWebBrowsingIcon} size={28} />,
    },
    {
      id: "owned",
      title: "ربط دومين خارجي",
      subtitle: "مثل GoDaddy أو غيره",
      icon: <HugeiconsIcon icon={Link01Icon} size={24} />,
    },
  ];

type DomainPathPickerProps = {
  value: DomainPath;
  onChange: (path: DomainPath) => void;
  /** Paths to show as not-yet-available; they render a قريباً badge and cannot be picked. */
  comingSoon?: DomainPath[];
};

const DomainPathPicker = ({
  value,
  onChange,
  comingSoon = [],
}: DomainPathPickerProps) => (
  <div className="grid gap-3 sm:grid-cols-3">
    {PATHS.map((path) => {
      const selected = value === path.id;
      const disabled = comingSoon.includes(path.id);

      return (
        <button
          key={path.id}
          type="button"
          onClick={() => !disabled && onChange(path.id)}
          disabled={disabled}
          aria-pressed={selected}
          className={cn(
            "relative rounded-2xl border p-4 transition-all",
            "flex flex-col items-start justify-center gap-1.5",
            disabled && "cursor-not-allowed opacity-60",
            selected
              ? "border-blue-300 bg-blue-50/70 shadow-sm dark:border-blue-800 dark:bg-blue-500/10"
              : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
          )}
        >
          {selected && (
            <span className="absolute top-3 left-3 flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">
              <HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={3} />
            </span>
          )}

          <span
            className={cn(
              "flex h-8 items-center justify-center",
              selected
                ? "text-blue-600 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-200",
            )}
          >
            {path.icon}
          </span>

          <span className="text-[15px] font-bold text-slate-900 dark:text-slate-50">
            {path.title}
          </span>
          <span
            className="text-xs text-slate-500 dark:text-slate-400"
            dir={path.id === "owned" ? "rtl" : "ltr"}
          >
            {path.subtitle}
          </span>

          {disabled && (
            <span className="mt-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              قريباً
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default DomainPathPicker;

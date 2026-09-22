import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  Cancel01Icon,
  FlashIcon,
  Shield01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: FlashIcon,
    title: "إعداد سريع",
    detail: "بضع خطوات فقط",
    chip: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  {
    icon: Shield01Icon,
    title: "آمن وموثوق",
    detail: "اتصال مشفر دائماً",
    chip: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  {
    icon: Analytics01Icon,
    title: "يعزز علامتك التجارية",
    detail: "ثقة أكبر لعملائك",
    chip: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  },
];

type DomainBrandPanelProps = {
  onClose?: () => void;
  className?: string;
};

const DomainBrandPanel = ({ onClose, className }: DomainBrandPanelProps) => (
  <aside
    className={cn(
      "relative flex flex-col gap-6 overflow-hidden p-6",
      "bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-50",
      "dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-sky-950/30",
      className,
    )}
  >
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
        className="absolute top-5 left-5 flex size-9 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-slate-900 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-900"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={16} />
      </button>
    )}

    <div className="flex items-center justify-center pt-8">
      <img
        src="/domain.png"
        alt=""
        aria-hidden="true"
        className="h-auto w-full max-w-[240px] object-contain drop-shadow-sm"
      />
    </div>

    <div>
      <h3 className="text-2xl leading-snug font-bold text-slate-900 dark:text-slate-50">
        اجعل علامتك أقرب إلى عملائك
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        استخدم دومين مخصص لزيادة المصداقية والظهور الاحترافي.
      </p>
    </div>

    <ul className="space-y-3">
      {FEATURES.map(({ icon, title, detail, chip }) => (
        <li key={title} className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-2xl",
              chip,
            )}
          >
            <HugeiconsIcon icon={icon} size={20} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </span>
            <span className="block text-[13px] text-slate-500 dark:text-slate-400">
              {detail}
            </span>
          </span>
        </li>
      ))}
    </ul>
  </aside>
);

export default DomainBrandPanel;

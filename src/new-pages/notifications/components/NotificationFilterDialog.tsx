import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationFilterValues } from "@/api/types/notification";
import FilterSlidersIcon from "@/components/icons/FilterSlidersIcon";
import Calendar17Icon from "@/components/icons/Calendar17Icon";

type NotificationFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: NotificationFilterValues;
  onApply: (filters: NotificationFilterValues) => void;
  onClear: () => void;
};

const AVAILABLE_FILTERS = 7;

type DateFieldKey = "dateFrom" | "dateTo" | "date";

function toInputDate(value?: string) {
  return value ?? "";
}

function formatDisplayDate(iso?: string, empty = "—") {
  if (!iso) return empty;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Display result of من / الى in the summary field */
function formatDateRangeResult(dateFrom?: string, dateTo?: string) {
  if (dateFrom && dateTo) {
    if (dateFrom === dateTo) return formatDisplayDate(dateFrom);
    return `${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}`;
  }
  if (dateFrom) return formatDisplayDate(dateFrom);
  if (dateTo) return formatDisplayDate(dateTo);
  return "اختر من / الى";
}

const labelClass =
  "mb-2 block text-sm font-medium text-slate-500 dark:text-slate-400";

const selectTriggerClass = cn(
  "h-12 w-full rounded-2xl text-right shadow-sm",
  "border-slate-200 bg-white text-slate-700",
  "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none",
);

type DateFieldProps = {
  fieldKey: DateFieldKey;
  activeField: DateFieldKey | null;
  onFocus: (key: DateFieldKey) => void;
  onBlur: () => void;
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder: string;
  variant?: "range" | "single";
};

const DateField = ({
  fieldKey,
  activeField,
  onFocus,
  onBlur,
  value,
  onChange,
  placeholder,
  variant = "range",
}: DateFieldProps) => {
  const isActive = activeField === fieldKey;
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    onFocus(fieldKey);
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    try {
      el.showPicker?.();
    } catch {
      // older browsers: focus is enough to open native picker
    }
  };

  const input = (
    <input
      ref={inputRef}
      type="date"
      value={toInputDate(value)}
      onFocus={() => onFocus(fieldKey)}
      onBlur={onBlur}
      onChange={(e) => onChange(e.target.value || undefined)}
      tabIndex={-1}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
    />
  );

  if (variant === "range") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        className={cn(
          "relative flex h-14 w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 text-start transition-all",
          "border-slate-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          "dark:border-slate-700 dark:bg-slate-900 dark:shadow-none",
          isActive &&
            "border-sky-200 shadow-md dark:border-transparent dark:bg-white",
        )}
      >
        <span
          className={cn(
            "pointer-events-none shrink-0 text-sm font-medium",
            isActive
              ? "text-slate-600 dark:text-slate-700"
              : "text-slate-500 dark:text-slate-400",
          )}
        >
          {placeholder}
        </span>

        <span className="pointer-events-none flex min-w-0 items-center gap-2">
          {value ? (
            <span
              className={cn(
                "truncate text-xs tabular-nums",
                isActive
                  ? "text-slate-600 dark:text-slate-700"
                  : "text-slate-400 dark:text-slate-500",
              )}
              dir="ltr"
            >
              {formatDisplayDate(value)}
            </span>
          ) : null}
          <Calendar17Icon size={22} />
        </span>
        {input}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
      className={cn(
        "relative flex h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 transition-all",
        "border-transparent bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]",
        "dark:border-white/10 dark:bg-white",
        isActive && "ring-2 ring-sky-400/40",
      )}
    >
      <span
        className="pointer-events-none min-w-0 flex-1 text-right text-[15px] font-medium tabular-nums text-[#3B4656]"
        dir="ltr"
      >
        {formatDisplayDate(value, "اختر تاريخ")}
      </span>
      <ChevronDown
        className="pointer-events-none size-5 shrink-0 text-sky-400"
        strokeWidth={2.5}
      />
      {input}
    </div>
  );
};

const NotificationFilterDialog = ({
  open,
  onOpenChange,
  filters,
  onApply,
  onClear,
}: NotificationFilterDialogProps) => {
  const [localFilters, setLocalFilters] =
    useState<NotificationFilterValues>(filters);
  const [activeField, setActiveField] = useState<DateFieldKey | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
      setActiveField(null);
    }
  }, [open, filters]);

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalFilters(filters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const empty: NotificationFilterValues = {};
    setLocalFilters(empty);
    onApply(empty);
    onClear();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        dir="rtl"
        showCloseButton={false}
        className={cn(
          "z-[60] flex flex-col gap-0 border-0 p-0",
          "bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100",
          isMobile
            ? cn(
                /* Mobile: bottom sheet like Figma */
                "inset-x-0 bottom-0 top-auto h-auto max-h-[92dvh] w-full max-w-none rounded-t-[1.75rem]",
                "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
              )
            : cn(
                /* Desktop: floating side panel */
                "top-3 bottom-3 left-3 h-auto w-[min(100%,36rem)] max-w-xl rounded-3xl",
                "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
              ),
        )}
      >
        {/* Mobile drag handle */}
        {isMobile ? (
          <div className="flex shrink-0 justify-center pt-3">
            <span className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        ) : null}

        <SheetHeader className="shrink-0 space-y-1 border-b border-slate-100 px-5 py-4 text-right sm:px-6 dark:border-white/5">
          <SheetTitle className="flex items-center justify-start gap-2 text-right text-lg font-bold text-slate-900 dark:text-white">
            <FilterSlidersIcon
              size={22}
              className="text-[#3B4656] dark:text-slate-300"
            />
            تطبيق الفلاتر المتاحة
          </SheetTitle>
          <SheetDescription className="text-right text-sm text-slate-500 dark:text-slate-400">
            تمتلك{" "}
            <span className="font-semibold text-violet-600 dark:text-violet-300">
              {AVAILABLE_FILTERS}
            </span>{" "}
            فلاتر متاحة في قائمة الفلاتر
          </SheetDescription>
        </SheetHeader>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 md:grid md:grid-cols-[1.1fr_1fr] md:items-end">
            {/* نتيجة من/الى — عرض فقط */}
            <div className="order-1 md:order-2">
              <p className={labelClass}>تاريخ الاشعار</p>
              <div
                className={cn(
                  "flex h-14 w-full items-center justify-between gap-3 rounded-2xl border px-4",
                  "border-transparent bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]",
                  "dark:border-white/10 dark:bg-white",
                )}
              >
                <span
                  className={cn(
                    "min-w-0 flex-1 text-right text-[15px] font-medium tabular-nums",
                    localFilters.dateFrom || localFilters.dateTo
                      ? "text-[#3B4656]"
                      : "text-slate-400",
                  )}
                  dir="ltr"
                >
                  {formatDateRangeResult(
                    localFilters.dateFrom,
                    localFilters.dateTo,
                  )}
                </span>
                <ChevronDown
                  className="size-5 shrink-0 text-sky-400"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div className="order-2 md:order-1">
              <p className={labelClass}>تاريخ الاشعار</p>
              <div className="grid grid-cols-2 gap-2.5">
                <DateField
                  fieldKey="dateFrom"
                  activeField={activeField}
                  onFocus={setActiveField}
                  onBlur={() => setActiveField(null)}
                  value={localFilters.dateFrom}
                  onChange={(dateFrom) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      dateFrom,
                      date: undefined,
                    }))
                  }
                  placeholder="من"
                />
                <DateField
                  fieldKey="dateTo"
                  activeField={activeField}
                  onFocus={setActiveField}
                  onBlur={() => setActiveField(null)}
                  value={localFilters.dateTo}
                  onChange={(dateTo) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      dateTo,
                      date: undefined,
                    }))
                  }
                  placeholder="الى"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className={labelClass}>النوع</p>
            <select
              value={localFilters.type ?? "all"}
              onChange={(e) => {
                const value = e.target.value;
                setLocalFilters((prev) => ({
                  ...prev,
                  type:
                    value === "all"
                      ? undefined
                      : (value as NotificationFilterValues["type"]),
                }));
              }}
              className={cn(selectTriggerClass, "w-full appearance-none px-3.5")}
            >
              <option value="all">جميع الأنواع</option>
              <option value="warning">تحذير</option>
              <option value="alert">تنبيه</option>
              <option value="new">أضافة</option>
              <option value="order">طلب</option>
            </select>
          </div>

          <div className="space-y-2">
            <p className={labelClass}>الحالة</p>
            <select
              value={localFilters.readStatus ?? "all"}
              onChange={(e) => {
                const value = e.target.value;
                setLocalFilters((prev) => ({
                  ...prev,
                  readStatus:
                    value === "all"
                      ? undefined
                      : (value as NotificationFilterValues["readStatus"]),
                }));
              }}
              className={cn(selectTriggerClass, "w-full appearance-none px-3.5")}
            >
              <option value="all">جميع الحالات</option>
              <option value="unread">غير مقروء</option>
              <option value="read">مقروء</option>
            </select>
          </div>
        </div>

        <SheetFooter
          className={cn(
            "relative shrink-0 border-t border-slate-100 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 dark:border-white/5",
            isMobile
              ? "flex-col gap-2 sm:flex-col"
              : "flex-row flex-wrap gap-3 sm:flex-row sm:space-x-0",
          )}
        >
          <Button
            type="button"
            onClick={handleApply}
            className={cn(
              "h-12 rounded-2xl border-0 bg-gradient-to-l from-[#4da3ff] to-[#6b5cff] text-base font-semibold text-white shadow-[0_8px_24px_rgba(77,163,255,0.35)] hover:opacity-95",
              isMobile ? "w-full" : "min-w-0 flex-[1.35]",
            )}
          >
            تطبيق الفلاتر
          </Button>
          <button
            type="button"
            onClick={handleCancel}
            className={cn(
              "text-base font-semibold transition-colors",
              isMobile
                ? "h-auto w-full bg-transparent py-1 text-center text-slate-400 hover:text-slate-600 dark:text-slate-400"
                : "h-12 min-w-0 flex-1 rounded-2xl bg-[#eef1f6] text-[#5a6b7d] hover:bg-[#e4e8ef] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
            )}
          >
            الغاء
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="w-full py-1 text-center text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            مسح الفلاتر
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationFilterDialog;

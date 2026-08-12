import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Calendar03Icon,
  FilterIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { NotificationFilterValues } from "@/api/types/notification";

type NotificationFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: NotificationFilterValues;
  onApply: (filters: NotificationFilterValues) => void;
  onClear: () => void;
};

const AVAILABLE_FILTERS = 7;

type DateFieldKey = "dateFrom" | "dateTo";

function toInputDate(value?: string) {
  return value ?? "";
}

function formatDisplayDate(iso?: string, empty = "—") {
  if (!iso) return empty;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function formatDateRangeResult(dateFrom?: string, dateTo?: string) {
  if (dateFrom && dateTo) {
    if (dateFrom === dateTo) return formatDisplayDate(dateFrom);
    return `${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}`;
  }
  if (dateFrom) return formatDisplayDate(dateFrom);
  if (dateTo) return formatDisplayDate(dateTo);
  return "اختر من / الى";
}

type DateFieldProps = {
  fieldKey: DateFieldKey;
  activeField: DateFieldKey | null;
  onFocus: (key: DateFieldKey) => void;
  onBlur: () => void;
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder: string;
};

const DateField = ({
  fieldKey,
  activeField,
  onFocus,
  onBlur,
  value,
  onChange,
  placeholder,
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
      // ignore
    }
  };

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
        "relative flex h-12 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-[14px] px-4 transition-colors",
        "bg-black/[0.04] dark:bg-[#0a0e2780]",
        isActive && "ring-1 ring-primary/40",
      )}
    >
      <span className="pointer-events-none text-sm text-muted-foreground">
        {placeholder}
      </span>
      <span className="pointer-events-none flex items-center gap-2">
        {value ? (
          <span className="text-xs tabular-nums text-foreground" dir="ltr">
            {formatDisplayDate(value)}
          </span>
        ) : null}
        <HugeiconsIcon
          icon={Calendar03Icon}
          size={20}
          className="text-muted-foreground"
        />
      </span>
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
          "z-[60] flex flex-col gap-0 border-0 p-0 text-foreground",
          "bg-surface",
          isMobile
            ? cn(
                "inset-x-0 bottom-0 top-auto h-auto max-h-[92dvh] w-full max-w-none rounded-t-[32px]",
                "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
              )
            : cn(
                "top-3 bottom-3 left-3 h-auto w-[min(100%,792px)] max-w-[792px] rounded-[32px]",
                "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
              ),
        )}
      >
        {isMobile ? (
          <div className="flex shrink-0 justify-center pt-3">
            <span className="h-1.5 w-12 rounded-full bg-border" />
          </div>
        ) : null}

        <SheetHeader className="relative shrink-0 space-y-1 overflow-hidden border-b border-border px-5 py-5 text-right sm:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-20 size-80 rounded-full bg-[#7d26f7]/15 blur-3xl"
          />
          <SheetTitle className="relative flex items-center justify-start gap-2 text-right text-xl font-normal text-foreground">
            <HugeiconsIcon icon={FilterIcon} size={22} />
            تطبيق الفلاتر المتاحة
          </SheetTitle>
          <SheetDescription className="relative text-right text-sm text-muted-foreground">
            تمتلك{" "}
            <span className="font-semibold text-foreground">
              {AVAILABLE_FILTERS}
            </span>{" "}
            فلاتر متاحة في قائمة الفلاتر
          </SheetDescription>
        </SheetHeader>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start">
            <div>
              <p className="mb-2 text-right text-sm font-medium text-muted-foreground">
                تاريخ الاشعار
              </p>
              <div className="grid grid-cols-2 gap-3">
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

            <div>
              <p className="mb-2 text-right text-sm font-medium text-foreground">
                تاريخ الاشعار
              </p>
              <div className="flex h-12 w-full items-center justify-between gap-3 rounded-[14px] bg-[#0a0e2780] bg-black/5 px-4 dark:bg-[#0a0e2780]">
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={20}
                  className="text-muted-foreground"
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 text-right text-sm font-medium tabular-nums",
                    localFilters.dateFrom || localFilters.dateTo
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                  dir="ltr"
                >
                  {formatDateRangeResult(
                    localFilters.dateFrom,
                    localFilters.dateTo,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-right text-sm font-medium text-muted-foreground">
              النوع
            </p>
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
              className="h-12 w-full appearance-none rounded-[14px] bg-black/5 px-3.5 text-right text-foreground dark:bg-[#0a0e2780]"
            >
              <option value="all">جميع الأنواع</option>
              <option value="warning">تحذير</option>
              <option value="alert">تنبيه</option>
              <option value="new">أضافة</option>
              <option value="order">طلب</option>
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-right text-sm font-medium text-muted-foreground">
              الحالة
            </p>
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
              className="h-12 w-full appearance-none rounded-[14px] bg-black/5 px-3.5 text-right text-foreground dark:bg-[#0a0e2780]"
            >
              <option value="all">جميع الحالات</option>
              <option value="unread">غير مقروء</option>
              <option value="read">مقروء</option>
            </select>
          </div>
        </div>

        <SheetFooter
          className={cn(
            "relative shrink-0 border-t border-border px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6",
            isMobile
              ? "flex-col gap-3 sm:flex-col"
              : "flex-row items-center justify-between gap-3 sm:flex-row sm:space-x-0",
          )}
        >
          <button
            type="button"
            onClick={handleApply}
            className={cn(
              "h-[60px] rounded-2xl bg-linear-to-l from-[#33c5ff] to-[#b282ff] text-lg font-bold text-white",
              isMobile ? "w-full" : "min-w-[225px] px-10",
            )}
          >
            تطبيق الفلاتر
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={cn(
              "text-lg font-bold text-[#4a5596] transition-colors hover:text-muted-foreground",
              isMobile ? "h-auto w-full py-2 text-center" : "h-[60px] min-w-[166px]",
            )}
          >
            الغاء
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="w-full py-1 text-center text-sm font-medium text-primary md:absolute md:bottom-2 md:left-1/2 md:-translate-x-1/2 md:w-auto"
          >
            مسح الفلاتر
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationFilterDialog;

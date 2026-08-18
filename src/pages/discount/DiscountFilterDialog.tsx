import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon } from "@hugeicons-pro/core-stroke-rounded";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DISCOUNT_STATUS } from "@/utils/constants";

export type DiscountFilterValues = {
  status: string | undefined;
  startDate: string;
  endDate: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: DiscountFilterValues;
  onApply: (values: DiscountFilterValues) => void;
  onClear: () => void;
};

const AVAILABLE_FILTERS = 2;
const fieldClass =
  "h-12 w-full appearance-none rounded-[14px] bg-black/5 px-3.5 text-right text-foreground outline-none dark:bg-[#0a0e2780]";

const DiscountFilterDialog = ({
  open,
  onOpenChange,
  values,
  onApply,
  onClear,
}: Props) => {
  const [status, setStatus] = useState<string | undefined>(values.status);
  const [startDate, setStartDate] = useState(values.startDate);
  const [endDate, setEndDate] = useState(values.endDate);
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
      setStatus(values.status);
      setStartDate(values.startDate);
      setEndDate(values.endDate);
    }
  }, [open, values.status, values.startDate, values.endDate]);

  const handleApply = () => {
    onApply({ status, startDate, endDate });
    onOpenChange(false);
  };

  const handleCancel = () => {
    setStatus(values.status);
    setStartDate(values.startDate);
    setEndDate(values.endDate);
    onOpenChange(false);
  };

  const handleClear = () => {
    setStatus(undefined);
    setStartDate("");
    setEndDate("");
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
            <span className="font-semibold text-foreground">{AVAILABLE_FILTERS}</span>{" "}
            فلاتر متاحة في قائمة الفلاتر
          </SheetDescription>
        </SheetHeader>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-2">
            <p className="text-right text-sm font-medium text-muted-foreground">الحالة</p>
            <select
              value={status ?? "all"}
              onChange={(e) => setStatus(e.target.value === "all" ? undefined : e.target.value)}
              className={fieldClass}
            >
              <option value="all">الكل</option>
              <option value={DISCOUNT_STATUS.ACTIVE}>نشط</option>
              <option value={DISCOUNT_STATUS.INACTIVE}>غير نشط</option>
              <option value={DISCOUNT_STATUS.EXPIRED}>منتهي</option>
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-right text-sm font-medium text-muted-foreground">
              الفترة الزمنية
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">من</p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">إلى</p>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
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

export default DiscountFilterDialog;

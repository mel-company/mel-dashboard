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
import type { CollectionFilterValues } from "@/hooks/use-collections-page";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: CollectionFilterValues;
  onApply: (values: CollectionFilterValues) => void;
  onClear: () => void;
};

const fieldClass =
  "h-12 w-full appearance-none rounded-[14px] bg-black/5 px-3.5 text-right text-foreground outline-none dark:bg-[#0a0e2780]";

/**
 * One filter, because a collection has one thing worth filtering on.
 *
 * The category sheet offers three — groups, discounts, visibility — and two of
 * those have no analogue here: a collection belongs to no group and carries no
 * discount. Shipping them anyway would be two controls that always return the
 * whole list, which is the dead-affordance problem the storefront half of this
 * feature exists to avoid.
 */
const CollectionFilterDialog = ({
  open,
  onOpenChange,
  values,
  onApply,
  onClear,
}: Props) => {
  const [enabled, setEnabled] = useState<boolean | undefined>(values.enabled);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Re-sync when reopened: the sheet keeps its own draft while open, and a
  // stale draft would silently re-apply a filter the merchant had cleared.
  useEffect(() => {
    if (open) setEnabled(values.enabled);
  }, [open, values.enabled]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        dir="rtl"
        className="gap-6 p-6"
      >
        <SheetHeader className="p-0 text-right">
          <SheetTitle className="flex items-center gap-2 text-right">
            <HugeiconsIcon icon={FilterIcon} size={20} />
            تصفية المجموعات
          </SheetTitle>
          <SheetDescription className="text-right">
            اختر ما تريد عرضه من المجموعات.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          <label
            htmlFor="collection-enabled"
            className="text-sm text-muted-foreground"
          >
            الحالة
          </label>
          <select
            id="collection-enabled"
            className={cn(fieldClass)}
            value={enabled === undefined ? "" : String(enabled)}
            onChange={(event) =>
              setEnabled(
                event.target.value === "" ? undefined : event.target.value === "true",
              )
            }
          >
            <option value="">الكل</option>
            <option value="true">ظاهرة في المتجر</option>
            <option value="false">مخفية</option>
          </select>
        </div>

        <SheetFooter className="flex-row-reverse gap-2 p-0">
          <button
            type="button"
            onClick={() => {
              onApply({ enabled });
              onOpenChange(false);
            }}
            className="h-12 flex-1 rounded-full bg-violet-100 font-medium text-violet-700 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]"
          >
            تطبيق
          </button>
          <button
            type="button"
            onClick={() => {
              setEnabled(undefined);
              onClear();
              onOpenChange(false);
            }}
            className="h-12 flex-1 rounded-full border border-slate-200 font-medium text-slate-600 dark:border-[#1d2757] dark:text-[#a4b1fa]"
          >
            مسح
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CollectionFilterDialog;

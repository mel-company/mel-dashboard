import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon } from "@hugeicons-pro/core-stroke-rounded";
import { ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useFetchGroups } from "@/api/wrappers/group.wrappers";

type GroupItem = { id: string; name: string };

export type CategoryFilterValues = {
  groupIds: string[];
  hasDiscount: boolean | undefined;
  enabled: boolean | undefined;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: CategoryFilterValues;
  onApply: (values: CategoryFilterValues) => void;
  onClear: () => void;
};

const AVAILABLE_FILTERS = 3;

const fieldClass =
  "h-12 w-full appearance-none rounded-[14px] bg-black/5 px-3.5 text-right text-foreground outline-none dark:bg-[#0a0e2780]";

const CategoryFilterDialog = ({
  open,
  onOpenChange,
  values,
  onApply,
  onClear,
}: Props) => {
  const [groupIds, setGroupIds] = useState<string[]>(values.groupIds);
  const [hasDiscount, setHasDiscount] = useState<boolean | undefined>(
    values.hasDiscount,
  );
  const [enabled, setEnabled] = useState<boolean | undefined>(values.enabled);
  const [isMobile, setIsMobile] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);

  const { data: groupsData } = useFetchGroups(undefined, open);
  const groups: GroupItem[] = Array.isArray(groupsData?.data)
    ? groupsData.data
    : Array.isArray(groupsData)
      ? groupsData
      : [];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (open) {
      setGroupIds(values.groupIds);
      setHasDiscount(values.hasDiscount);
      setEnabled(values.enabled);
      setGroupsOpen(false);
    }
  }, [open, values.groupIds, values.hasDiscount, values.enabled]);

  const handleApply = () => {
    onApply({ groupIds, hasDiscount, enabled });
    onOpenChange(false);
  };

  const handleCancel = () => {
    setGroupIds(values.groupIds);
    setHasDiscount(values.hasDiscount);
    setEnabled(values.enabled);
    onOpenChange(false);
  };

  const handleClear = () => {
    setGroupIds([]);
    setHasDiscount(undefined);
    setEnabled(undefined);
    onClear();
    onOpenChange(false);
  };

  const toggleGroup = (groupId: string) => {
    setGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const groupsLabel =
    groupIds.length === 0
      ? "جميع المجموعات"
      : groupIds.length === 1
        ? (groups.find((g) => g.id === groupIds[0])?.name ?? "مجموعة واحدة")
        : `${groupIds.length} مجموعات`;

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
          <div className="space-y-2">
            <p className="text-right text-sm font-medium text-muted-foreground">
              المجموعات
            </p>
            <button
              type="button"
              onClick={() => setGroupsOpen((v) => !v)}
              className={cn(fieldClass, "flex items-center justify-between")}
            >
              <span
                className={cn(
                  "truncate",
                  groupIds.length === 0 && "text-muted-foreground",
                )}
              >
                {groupsLabel}
              </span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-muted-foreground transition-transform",
                  groupsOpen && "rotate-180",
                )}
              />
            </button>
            {groupsOpen ? (
              <div className="max-h-52 overflow-y-auto rounded-[14px] bg-black/5 p-2 dark:bg-[#0a0e2780]">
                {groups.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                    لا توجد مجموعات
                  </p>
                ) : (
                  groups.map((group) => {
                    const checked = groupIds.includes(group.id);
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-right text-sm hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <span className="text-foreground">{group.name}</span>
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-md border",
                            checked
                              ? "border-[#b282ff] bg-[#b282ff] text-white"
                              : "border-border bg-transparent",
                          )}
                        >
                          {checked ? "✓" : null}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-right text-sm font-medium text-muted-foreground">
              يحتوي على خصم
            </p>
            <select
              value={
                hasDiscount === undefined ? "all" : hasDiscount ? "yes" : "no"
              }
              onChange={(e) => {
                const v = e.target.value;
                setHasDiscount(v === "all" ? undefined : v === "yes");
              }}
              className={fieldClass}
            >
              <option value="all">الكل</option>
              <option value="yes">نعم</option>
              <option value="no">لا</option>
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-right text-sm font-medium text-muted-foreground">
              الحالة
            </p>
            <select
              value={enabled === undefined ? "all" : enabled ? "yes" : "no"}
              onChange={(e) => {
                const v = e.target.value;
                setEnabled(v === "all" ? undefined : v === "yes");
              }}
              className={fieldClass}
            >
              <option value="all">الكل</option>
              <option value="yes">مفعّل</option>
              <option value="no">معطّل</option>
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

export default CategoryFilterDialog;

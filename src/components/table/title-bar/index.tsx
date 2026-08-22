import { usePage } from "@/hooks/pages"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"


const TitleBar = ({
  children,
  description,
  count,
  listLabel: listLabelProp,
  className,
}: {
  children?: React.ReactNode;
  description?: React.ReactNode;
  /** When set and > 0, shows “تمتلك N حركة…”. When missing/0, that line is omitted. */
  count?: number;
  /** Override the list name in the count subtitle (e.g. المجموعات). */
  listLabel?: string;
  className?: string;
}) => {
  const { currentPage } = usePage()
  if (!currentPage) return null

  // Static copy only (no fake movement counts)
  const defaultDescriptions: Record<string, string> = {
    "": "يمكنك مراقبة جميع نشاطاتك في واجهة واحدة",
    "/settings": "يمكنك تعديل تفاصيل وإعدادات المتجر المخصص لك",
    "/pos": "اختر المنتجات وأتمم البيع مباشرة من نقطة البيع",
  };

  const listLabels: Record<string, string> = {
    "": "الطلبات",
    "/orders": "الطلبات",
    "/products": "المنتجات",
    "/customers": "العملاء",
    "/employees": "الموظفين",
    "/categories": "الفئات",
    "/discounts": "الخصومات والكوبونات",
    "/tickets": "الدعم الفني",
    "/notifications": "الإشعارات",
  };

  const listLabel =
    listLabelProp ?? listLabels[currentPage.slug] ?? currentPage.label;

  const countSubtitle =
    typeof count === "number" && count > 0
      ? `تمتلك ${count} حركة جديدة في قائمة ${listLabel}`
      : null;

  const subtitle =
    description ??
    countSubtitle ??
    defaultDescriptions[currentPage.slug] ??
    null;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 text-blue-950 sm:flex-row sm:items-center sm:justify-between dark:text-[#e4e7fc]",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <HugeiconsIcon icon={currentPage?.icon?.normal} className="size-6 shrink-0 sm:size-7" />
          <h1 className="truncate text-xl font-bold sm:text-2xl">{currentPage?.label}</h1>
        </div>
        {subtitle ? (
          <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground/80 sm:line-clamp-none">
            {subtitle}
          </div>
        ) : null}
      </div>
      {children ? (
        <div className="flex w-full min-w-0 shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end [&>*]:w-full sm:[&>*]:w-auto [&_button]:min-h-11">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default TitleBar

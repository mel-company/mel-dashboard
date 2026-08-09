import { usePage } from "@/hooks/pages"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"


const TitleBar = ({
  children,
  description,
  className,
}: {
  children?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) => {
  const { currentPage } = usePage()
  if (!currentPage) return null

  const defaultDescriptions: Record<string, string> = {
    "/settings": "يمكنك تعديل تفاصيل وإعدادات المتجر المخصص لك",
    "/discounts": "تمتلك حركات جديدة في قائمة الخصومات والكوبونات",
    "/notifications": "تمتلك إشعارات جديدة في قائمة الإشعارات",
    "/pos": "اختر المنتجات وأتمم البيع مباشرة من نقطة البيع",
  };

  const subtitle =
    description ??
    defaultDescriptions[currentPage.slug] ??
    "تمتلك 46 حركة جديدة في قائمة المنتجات";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 text-blue-950 sm:flex-row sm:items-center sm:justify-between dark:text-blue-100",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <HugeiconsIcon icon={currentPage?.icon?.normal} className="size-6 shrink-0 sm:size-7" />
          <h1 className="truncate text-xl font-bold sm:text-2xl">{currentPage?.label}</h1>
        </div>
        <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground/80 sm:line-clamp-none">
          {subtitle}
        </div>
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

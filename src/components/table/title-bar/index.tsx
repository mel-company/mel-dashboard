import { usePage } from "@/hooks/pages"
import { HugeiconsIcon } from "@hugeicons/react"


const TitleBar = ({
  children,
  description,
}: {
  children?: React.ReactNode;
  description?: string;
}) => {
  const { currentPage } = usePage()
  if (!currentPage) return null

  const defaultDescriptions: Record<string, string> = {
    "/settings": "يمكنك تعديل تفاصيل وإعدادات المتجر المخصص لك",
  };

  const subtitle =
    description ??
    defaultDescriptions[currentPage.slug] ??
    "تمتلك 46 حركة جديدة في قائمة المنتجات";

  return (
    <div className="w-full flex justify-between items-center text-blue-950 dark:text-blue-100">
      <div>
        <div className="flex items-center gap-1">
          <HugeiconsIcon icon={currentPage?.icon?.normal} />
          <h1 className="font-bold text-2xl">{currentPage?.label}</h1>
        </div>
        <p className="text-xs text-muted-foreground/80">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

export default TitleBar
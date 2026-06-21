import { usePage } from "@/hooks/pages"
import { HugeiconsIcon } from "@hugeicons/react"


const TitleBar = ({ children }: { children?: React.ReactNode }) => {
  const { currentPage } = usePage()
  if (!currentPage) return null

  return (
    <div className="w-full flex justify-between items-center text-blue-950">
      <div>
        <div className="flex items-center gap-1">
          <HugeiconsIcon icon={currentPage?.icon?.normal} />
          <h1 className="font-bold text-2xl">{currentPage?.label}</h1>
        </div>
        <p className="text-sm text-muted-foreground">تمتلك 46 حركة جديدة في قائمة المنتجات</p>
      </div>
      {children}
    </div>
  )
}

export default TitleBar
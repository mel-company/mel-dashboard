import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

const ProductTableHeader = () => {
    const thClass = "h-11 px-4 text-right font-semibold text-muted-foreground";
    return (
        <TableHeader >
            <TableRow className="bg-slate-50 dark:bg-slate-950">
                <TableHead className={cn("h-11 px-4 text-right font-semibold text-muted-foreground", "w-14")}>#</TableHead>
                <TableHead className={cn(thClass, "w-16")}>الصورة</TableHead>
                <TableHead className={cn(thClass, "min-w-[220px]")}>معلومات المنتج</TableHead>
                <TableHead className={cn(thClass, "min-w-[160px]")}>الفئات</TableHead>
                <TableHead className={thClass}>السعر</TableHead>
                <TableHead className={thClass}>تكلفة المنتج</TableHead>
                <TableHead className={cn(thClass, "w-20")}>التقييم</TableHead>
                <TableHead className={cn(thClass, "w-24")}>الحالة</TableHead>
                <TableHead className={cn(thClass, "w-28")}>العمليات</TableHead>
            </TableRow>
        </TableHeader>
    )
}

export default ProductTableHeader
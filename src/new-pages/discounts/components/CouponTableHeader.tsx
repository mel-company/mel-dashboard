import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CouponTableHeader = () => (
  <TableHeader>
    <TableRow className="border-b border-slate-100 hover:bg-transparent">
      <TableHead className="w-14 text-right text-sm font-semibold text-slate-600">#</TableHead>
      <TableHead className="min-w-[180px] text-right text-sm font-semibold text-slate-600">
        تفاصيل الكوبون
      </TableHead>
      <TableHead className="w-24 text-right text-sm font-semibold text-slate-600">
        نسبة الخصم
      </TableHead>
      <TableHead className="min-w-[130px] text-right text-sm font-semibold text-slate-600">
        تاريخ البدء
      </TableHead>
      <TableHead className="min-w-[130px] text-right text-sm font-semibold text-slate-600">
        تاريخ النفاذ
      </TableHead>
      <TableHead className="w-28 text-right text-sm font-semibold text-slate-600">
        مرات الاستخدام
      </TableHead>
      <TableHead className="w-36 text-center text-sm font-semibold text-slate-600">
        الحالة
      </TableHead>
      <TableHead className="w-32 text-center text-sm font-semibold text-slate-600">
        العمليات
      </TableHead>
    </TableRow>
  </TableHeader>
);

export default CouponTableHeader;

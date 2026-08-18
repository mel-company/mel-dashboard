import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import type { CouponListItem } from "@/api/types/coupon";
import CouponTableHeader from "./CouponTableHeader";
import CouponRow from "./CouponRow";

type CouponTableProps = {
  coupons: CouponListItem[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (coupon: CouponListItem) => void;
  onToggleStatus: (coupon: CouponListItem) => void;
};

const CouponTable = ({
  coupons,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: CouponTableProps) => {
  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);

  const totalPages = Math.ceil(coupons.length / viewCount) || 1;
  const startIndex = (activePage - 1) * viewCount;
  const paginated = coupons.slice(startIndex, startIndex + viewCount);

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      <Table>
        <CouponTableHeader />
        <TableBody>
          {paginated.map((coupon) => (
            <CouponRow
              key={coupon.id}
              coupon={coupon}
              onView={() => onView(coupon.id)}
              onEdit={() => onEdit(coupon.id)}
              onDelete={() => onDelete(coupon)}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/6">
        <Pagination
          totalPages={totalPages}
          activePage={activePage}
          viewCount={viewCount}
          onPageChange={setActivePage}
          onViewCountChange={(count) => {
            setViewCount(count);
            setActivePage(1);
          }}
        />
      </div>
    </div>
  );
};

export default CouponTable;

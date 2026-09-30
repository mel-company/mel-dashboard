import type { ReactNode } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import type { CouponListItem } from "@/api/types/coupon";
import CouponTableHeader from "./CouponTableHeader";
import CouponRow from "./CouponRow";
import { getCouponUsageCount } from "../coupon-utils";
import {
  useTablePagination,
  byCreatedAt,
  num,
  text,
  time,
} from "@/hooks/use-table-pagination";

const COUPON_COLUMNS = {
  value: (c: unknown) => num(c, "value", "amount"),
  startDate: (c: unknown) => time(c, "startsAt", "start_date"),
  endDate: (c: unknown) => time(c, "expiresAt", "end_date"),
  usage: (c: unknown) => num(c, "usage_count", "usageCount"),
  status: (c: unknown) => text(c, "status"),
};

type CouponTableProps = {
  /** Figma keeps the list toolbar inside the table card. */
  toolbar?: ReactNode;
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
  onToggleStatus, toolbar }: CouponTableProps) => {
  const { pageItems: paginated, paginationProps, sort } =
    useTablePagination({
      items: coupons,
      getSortValue: byCreatedAt,
      columns: COUPON_COLUMNS,
    });

  // Bars are relative to the busiest row on the page.
  const maxUsage = Math.max(1, ...paginated.map((c) => getCouponUsageCount(c)));


  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      {toolbar ? <div className="mb-4 sm:mb-5">{toolbar}</div> : null}
      <Table>
        <CouponTableHeader sort={sort} />
        <TableBody>
          {paginated.map((coupon) => (
            <CouponRow
              key={coupon.id}
              coupon={coupon}
              maxUsage={maxUsage}
              onView={() => onView(coupon.id)}
              onEdit={() => onEdit(coupon.id)}
              onDelete={() => onDelete(coupon)}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/6">
        <Pagination {...paginationProps} />
      </div>
    </div>
  );
};

export default CouponTable;

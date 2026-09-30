import type { ReactNode } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import type { DiscountListItem } from "@/api/types/discount";
import DiscountTableHeader from "./DiscountTableHeader";
import DiscountRow from "./DiscountRow";
import { getDiscountUsageCount } from "../utils";
import {
  useTablePagination,
  byCreatedAt,
  num,
  text,
  time,
} from "@/hooks/use-table-pagination";

const DISCOUNT_COLUMNS = {
  percentage: (d: unknown) => num(d, "discount_percentage", "value"),
  startDate: (d: unknown) => time(d, "discount_start_date", "start_date"),
  endDate: (d: unknown) => time(d, "discount_end_date", "end_date"),
  usage: (d: unknown) => num(d, "usage_count", "usageCount"),
  status: (d: unknown) => text(d, "discount_status", "status"),
};

type DiscountTableProps = {
  /** Figma keeps the list toolbar inside the table card. */
  toolbar?: ReactNode;
  discounts: DiscountListItem[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (discount: DiscountListItem) => void;
  onToggleStatus: (discount: DiscountListItem) => void;
};

const DiscountTable = ({
  discounts,
  onView,
  onEdit,
  onDelete,
  onToggleStatus, toolbar }: DiscountTableProps) => {
  const { pageItems: paginated, paginationProps, sort } =
    useTablePagination({
      items: discounts,
      getSortValue: byCreatedAt,
      columns: DISCOUNT_COLUMNS,
    });

  // Bars are relative to the busiest row on the page.
  const maxUsage = Math.max(1, ...paginated.map((d) => getDiscountUsageCount(d)));


  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      {toolbar ? <div className="mb-4 sm:mb-5">{toolbar}</div> : null}
      <Table>
        <DiscountTableHeader sort={sort} />
        <TableBody>
          {paginated.map((discount) => (
            <DiscountRow
              key={discount.id}
              discount={discount}
              maxUsage={maxUsage}
              onView={() => onView(discount.id)}
              onEdit={() => onEdit(discount.id)}
              onDelete={() => onDelete(discount)}
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

export default DiscountTable;

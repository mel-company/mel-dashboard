import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import type { DiscountListItem } from "@/api/types/discount";
import DiscountTableHeader from "./DiscountTableHeader";
import DiscountRow from "./DiscountRow";

type DiscountTableProps = {
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
  onToggleStatus,
}: DiscountTableProps) => {
  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);

  const totalPages = Math.ceil(discounts.length / viewCount) || 1;
  const startIndex = (activePage - 1) * viewCount;
  const paginated = discounts.slice(startIndex, startIndex + viewCount);

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-white p-4 shadow-sm sm:p-6">
      <Table>
        <DiscountTableHeader />
        <TableBody>
          {paginated.map((discount, index) => (
            <DiscountRow
              key={discount.id}
              discount={discount}
              rowIndex={startIndex + index}
              onView={() => onView(discount.id)}
              onEdit={() => onEdit(discount.id)}
              onDelete={() => onDelete(discount)}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 border-t border-slate-100 pt-4">
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

export default DiscountTable;

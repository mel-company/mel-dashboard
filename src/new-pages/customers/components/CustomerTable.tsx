import type { ReactNode } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import CustomerTableHeader from "./CustomerTableHeader";
import CustomerRow from "./CustomerRow";
import {
  useTablePagination,
  byCreatedAt,
  num,
  text,
} from "@/hooks/use-table-pagination";

const CUSTOMER_COLUMNS = {
  id: (c: unknown) => text(c, "customerCode", "id"),
  name: (c: unknown) => text(c, "name", "full_name"),
  phone: (c: unknown) => text(c, "phone"),
  location: (c: unknown) => text(c, "city", "address"),
  orders: (c: unknown) => num(c, "ordersCount", "orders_count"),
  rating: (c: unknown) => num(c, "rate", "rating"),
};

type CustomerTableProps = {
  /** Figma keeps the list toolbar inside the table card. */
  toolbar?: ReactNode;
  customers: any[];
  onDelete: (id: string) => void;
};

const CustomerTable = ({ customers, onDelete, toolbar }: CustomerTableProps) => {
  const { startIndex, pageItems: paginatedCustomers, paginationProps, sort } =
    useTablePagination({
      items: customers,
      getSortValue: byCreatedAt,
      columns: CUSTOMER_COLUMNS,
    });





  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      {toolbar ? <div className="mb-4 sm:mb-5">{toolbar}</div> : null}
      <Table>
        <CustomerTableHeader sort={sort} />
        <TableBody>
          {paginatedCustomers.map((customer, index) => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              rowIndex={startIndex + index}
              onDelete={onDelete}
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

export default CustomerTable;

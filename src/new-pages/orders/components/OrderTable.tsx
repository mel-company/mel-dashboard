import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import OrderTableHeader from "./OrderTableHeader";
import OrderRow from "./OrderRow";
import {
  useTablePagination,
  byCreatedAt,
  get,
  num,
  text,
} from "@/hooks/use-table-pagination";

const ORDER_COLUMNS = {
  number: (o: unknown) => text(o, "orderNumber", "order_number", "number"),
  customer: (o: unknown) =>
    String(get(o, "customer", "name") ?? get(o, "customer", "full_name") ?? ""),
  address: (o: unknown) => text(o, "address"),
  total: (o: unknown) =>
    Number(get(o, "pricing", "totalPrice") ?? 0) || num(o, "total", "total_price"),
  date: byCreatedAt,
  status: (o: unknown) => text(o, "status"),
};

type OrderTableProps = {
  /** Figma keeps the list toolbar inside the table card. */
  toolbar?: ReactNode;
  orders: any[];
  imageBaseUrl?: string;
  calculateTotal: (products: any[]) => number;
};

const OrderTable = ({
  orders,
  imageBaseUrl,
  calculateTotal, toolbar }: OrderTableProps) => {
  const navigate = useNavigate();
  const { pageItems: paginatedOrders, paginationProps, sort } =
    useTablePagination({
      items: orders,
      getSortValue: byCreatedAt,
      columns: ORDER_COLUMNS,
    });


  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      {toolbar ? <div className="mb-4 sm:mb-5">{toolbar}</div> : null}
      <Table>
        <OrderTableHeader sort={sort} />
        <TableBody>
          {paginatedOrders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              imageBaseUrl={imageBaseUrl}
              calculateTotal={calculateTotal}
              onOpen={(id) => navigate(`/orders/${id}`)}
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

export default OrderTable;

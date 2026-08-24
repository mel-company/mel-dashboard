import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import OrderTableHeader from "./OrderTableHeader";
import OrderRow from "./OrderRow";

type OrderTableProps = {
  orders: any[];
  imageBaseUrl?: string;
  calculateTotal: (products: any[]) => number;
};

const OrderTable = ({
  orders,
  imageBaseUrl,
  calculateTotal,
}: OrderTableProps) => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);

  const totalPages = Math.ceil(orders.length / viewCount) || 1;
  const startIndex = (activePage - 1) * viewCount;
  const paginatedOrders = orders.slice(startIndex, startIndex + viewCount);

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      <Table>
        <OrderTableHeader />
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

export default OrderTable;

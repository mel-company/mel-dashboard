import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import CustomerTableHeader from "./CustomerTableHeader";
import CustomerRow from "./CustomerRow";

type CustomerTableProps = {
  customers: any[];
  onDelete: (id: string) => void;
};

const CustomerTable = ({ customers, onDelete }: CustomerTableProps) => {
  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);

  const totalPages = Math.ceil(customers.length / viewCount) || 1;

  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  const handleViewCountChange = (count: number) => {
    setViewCount(count);
    setActivePage(1);
  };

  const startIndex = (activePage - 1) * viewCount;
  const paginatedCustomers = customers.slice(startIndex, startIndex + viewCount);

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-white p-6 shadow-none">
      <Table>
        <CustomerTableHeader />
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
      <div className="mt-4 border-t border-slate-100 pt-4">
        <Pagination
          totalPages={totalPages}
          activePage={activePage}
          viewCount={viewCount}
          onPageChange={handlePageChange}
          onViewCountChange={handleViewCountChange}
        />
      </div>
    </div>
  );
};

export default CustomerTable;

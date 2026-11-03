import type { ReactNode } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import EmployeeTableHeader from "./EmployeeTableHeader";
import EmployeeRow from "./EmployeeRow";
import {
  useTablePagination,
  type CursorPaging,
} from "@/hooks/use-table-pagination";

type EmployeeTableProps = {
  paging?: CursorPaging;
  toolbar?: ReactNode;
  employees: any[];
  onDelete: (id: string) => void;
};

const EmployeeTable = ({
  employees,
  onDelete,
  toolbar,
  paging,
}: EmployeeTableProps) => {
  const { startIndex, pageItems, paginationProps } = useTablePagination({
    ...paging,
    items: employees,
  });

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      {toolbar ? <div className="mb-4 sm:mb-5">{toolbar}</div> : null}
      <Table>
        <EmployeeTableHeader />
        <TableBody>
          {pageItems.map((employee, index) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
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

export default EmployeeTable;

import type { ReactNode } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import type { SupportTicketListItem } from "@/api/types/ticket";
import TicketTableHeader from "./TicketTableHeader";
import TicketRow from "./TicketRow";
import {
  useTablePagination,
  byCreatedAt,
  text,
  time,
} from "@/hooks/use-table-pagination";

const TICKET_COLUMNS = {
  id: (t: unknown) => text(t, "id"),
  title: (t: unknown) => text(t, "title"),
  type: (t: unknown) => text(t, "type"),
  department: (t: unknown) => text(t, "department"),
  date: (t: unknown) => time(t, "createdAt", "created_at"),
  status: (t: unknown) => text(t, "status"),
};

type TicketTableProps = {
  /** Figma keeps the list toolbar inside the table card. */
  toolbar?: ReactNode;
  tickets: SupportTicketListItem[];
};

const TicketTable = ({ tickets, toolbar }: TicketTableProps) => {
  const { startIndex, pageItems: paginatedTickets, paginationProps, sort } =
    useTablePagination({
      items: tickets,
      getSortValue: byCreatedAt,
      columns: TICKET_COLUMNS,
    });


  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      {toolbar ? <div className="mb-4 sm:mb-5">{toolbar}</div> : null}
      <Table>
        <TicketTableHeader sort={sort} />
        <TableBody>
          {paginatedTickets.map((ticket, index) => (
            <TicketRow
              key={ticket.id}
              ticket={ticket}
              rowIndex={startIndex + index}
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

export default TicketTable;

import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import type { SupportTicketListItem } from "@/api/types/ticket";
import TicketTableHeader from "./TicketTableHeader";
import TicketRow from "./TicketRow";

type TicketTableProps = {
  tickets: SupportTicketListItem[];
};

const TicketTable = ({ tickets }: TicketTableProps) => {
  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);

  const totalPages = Math.ceil(tickets.length / viewCount) || 1;
  const startIndex = (activePage - 1) * viewCount;
  const paginatedTickets = tickets.slice(startIndex, startIndex + viewCount);

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      <Table>
        <TicketTableHeader />
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

export default TicketTable;

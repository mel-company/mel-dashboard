import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import { GroupTableHeader } from "./CategoryTableHeader";
import GroupRow from "./GroupRow";
import GroupDeleteModal from "./GroupDeleteModal";

type GroupTableProps = {
  groups: any[];
  refetch: () => void;
  imageBaseUrl?: string;
};

const GroupTable = ({ groups, refetch, imageBaseUrl = "" }: GroupTableProps) => {
  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);
  const [deleteGroup, setDeleteGroup] = useState<any>(null);

  const totalPages = Math.ceil(groups.length / viewCount) || 1;
  const startIndex = (activePage - 1) * viewCount;
  const paginated = groups.slice(startIndex, startIndex + viewCount);

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      <Table>
        <GroupTableHeader />
        <TableBody>
          {paginated.map((group) => (
            <GroupRow
              key={group.id}
              group={group}
              refetch={refetch}
              onDelete={setDeleteGroup}
              imageBaseUrl={imageBaseUrl}
            />
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
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
      <GroupDeleteModal
        group={deleteGroup}
        onOpenChange={(open) => !open && setDeleteGroup(null)}
        onSuccess={refetch}
        imageBaseUrl={imageBaseUrl}
      />
    </div>
  );
};

export default GroupTable;

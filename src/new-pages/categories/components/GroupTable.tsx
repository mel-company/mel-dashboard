import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import { GroupTableHeader } from "./CategoryTableHeader";
import GroupRow from "./GroupRow";
import GroupDeleteModal from "./GroupDeleteModal";
import { useTablePagination, byCreatedAt } from "@/hooks/use-table-pagination";

type GroupTableProps = {
  groups: any[];
  refetch: () => void;
  imageBaseUrl?: string;
};

const GroupTable = ({ groups, refetch, imageBaseUrl = "" }: GroupTableProps) => {
  const { pageItems: paginated, paginationProps } =
    useTablePagination({ items: groups, getSortValue: byCreatedAt });
  const [deleteGroup, setDeleteGroup] = useState<any>(null);


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
        <Pagination {...paginationProps} />
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

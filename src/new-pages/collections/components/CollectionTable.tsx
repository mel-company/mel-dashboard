import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import { CollectionTableHeader } from "./CollectionTableHeader";
import CollectionRow from "./CollectionRow";

type CollectionTableProps = {
  collections: any[];
  refetch: () => void;
  onDelete: (collection: any) => void;
  imageBaseUrl?: string;
};

const CollectionTable = ({
  collections,
  refetch,
  onDelete,
  imageBaseUrl = "",
}: CollectionTableProps) => {
  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);

  const totalPages = Math.ceil(collections.length / viewCount) || 1;
  const startIndex = (activePage - 1) * viewCount;
  const paginated = collections.slice(startIndex, startIndex + viewCount);

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      <Table>
        <CollectionTableHeader />
        <TableBody>
          {paginated.map((collection) => (
            <CollectionRow
              key={collection.id}
              collection={collection}
              refetch={refetch}
              onDelete={onDelete}
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
    </div>
  );
};

export default CollectionTable;

import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import { CollectionTableHeader } from "./CollectionTableHeader";
import CollectionRow from "./CollectionRow";
import {
  useTablePagination,
  byCreatedAt,
  num,
  text,
} from "@/hooks/use-table-pagination";

const COLLECTION_COLUMNS = {
  id: (c: unknown) => text(c, "name"),
  products: (c: unknown) => num(c, "productsCount", "products_count"),
  status: (c: unknown) => text(c, "is_active", "status"),
};

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
  const { pageItems: paginated, paginationProps, sort } =
    useTablePagination({
      items: collections,
      getSortValue: byCreatedAt,
      columns: COLLECTION_COLUMNS,
    });


  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      <Table>
        <CollectionTableHeader sort={sort} />
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
        <Pagination {...paginationProps} />
      </div>
    </div>
  );
};

export default CollectionTable;

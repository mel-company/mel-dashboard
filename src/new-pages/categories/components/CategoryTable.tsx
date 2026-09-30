import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import Pagination from "@/components/table/pagination";
import { CategoryTableHeader } from "./CategoryTableHeader";
import CategoryRow from "./CategoryRow";
import CategoryDeleteModal from "./CategoryDeleteModal";
import { useTablePagination, byCreatedAt } from "@/hooks/use-table-pagination";

type CategoryTableProps = {
  categories: any[];
  refetch: () => void;
  imageBaseUrl?: string;
};

const CategoryTable = ({
  categories,
  refetch,
  imageBaseUrl = "",
}: CategoryTableProps) => {
  const { pageItems: paginated, paginationProps } =
    useTablePagination({ items: categories, getSortValue: byCreatedAt });
  const [deleteCategory, setDeleteCategory] = useState<any>(null);


  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-4 dark:border-transparent dark:bg-[#0a0e27]">
      <Table>
        <CategoryTableHeader />
        <TableBody>
          {paginated.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              refetch={refetch}
              onDelete={setDeleteCategory}
              imageBaseUrl={imageBaseUrl}
            />
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
        <Pagination {...paginationProps} />
      </div>
      <CategoryDeleteModal
        category={deleteCategory}
        onOpenChange={(open) => !open && setDeleteCategory(null)}
        onSuccess={refetch}
        imageBaseUrl={imageBaseUrl}
      />
    </div>
  );
};

export default CategoryTable;

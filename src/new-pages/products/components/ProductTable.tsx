import type { ReactNode } from "react";
import {

  TableBody,
  Table,
} from "@/components/ui/table";
import type { ProductListItem } from "@/api/types/product";

import Pagination from "@/components/table/pagination";
import ProductRow from "./row";
import ProductTableHeader from "./header";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import {
  useTablePagination,
  byCreatedAt,
  get,
  num,
  text,
} from "@/hooks/use-table-pagination";

const PRODUCT_COLUMNS = {
  name: (p: unknown) => text(p, "title", "name"),
  category: (p: unknown) =>
    String(
      get(p, "categories", "0", "name") ?? get(p, "category", "name") ?? "",
    ),
  quantity: (p: unknown) => num(p, "quantity", "stock"),
  price: (p: unknown) => num(p, "price"),
  cost: (p: unknown) => num(p, "cost", "cost_to_produce", "compare_at_price"),
  rating: (p: unknown) => num(p, "rate", "rating"),
  status: (p: unknown) => text(p, "status", "enabled"),
};

interface ProductTableProps {
  /** Figma keeps the list toolbar inside the table card. */
  toolbar?: ReactNode;
  products: ProductListItem[];
  onDelete: (id: string) => void;
  imageBaseUrl?: string;
}

const ProductTable = ({ products, onDelete, imageBaseUrl = "", toolbar }: ProductTableProps) => {
  const resolvedBaseUrl = useImageBaseUrl(imageBaseUrl);

  const { startIndex, pageItems: paginatedProducts, paginationProps, sort } =
    useTablePagination({
      items: products,
      getSortValue: byCreatedAt,
      columns: PRODUCT_COLUMNS,
    });





  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-transparent bg-white p-4 shadow-[0_2px_12px_rgba(17,44,113,0.05)] sm:p-6 dark:border-white/[0.06] dark:bg-[#0a0e27] dark:shadow-none">
      {toolbar ? <div className="mb-4 sm:mb-5">{toolbar}</div> : null}
      <Table>
        <ProductTableHeader sort={sort} />
        <TableBody>
          {paginatedProducts.map((product, index) => (
            <ProductRow
              key={product.id}
              product={product}
              rowIndex={startIndex + index}
              onDelete={onDelete}
              imageBaseUrl={resolvedBaseUrl}
            />
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 border-t border-[#e7edf6] pt-4 dark:border-white/[0.06]">
        <Pagination {...paginationProps} />
      </div>
    </div>
  );
};

export default ProductTable;

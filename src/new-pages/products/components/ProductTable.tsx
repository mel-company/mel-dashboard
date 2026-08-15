import { useState } from "react";
import {

  TableBody,
  Table,
} from "@/components/ui/table";
import type { ProductListItem } from "@/api/types/product";

import Pagination from "@/components/table/pagination";
import ProductRow from "./row";
import ProductTableHeader from "./header";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";

interface ProductTableProps {
  products: ProductListItem[];
  onDelete: (id: string) => void;
  imageBaseUrl?: string;
}

const ProductTable = ({ products, onDelete, imageBaseUrl = "" }: ProductTableProps) => {
  const resolvedBaseUrl = useImageBaseUrl(imageBaseUrl);

  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);

  const totalPages = Math.ceil(products.length / viewCount) || 1;

  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  const handleViewCountChange = (count: number) => {
    setViewCount(count);
    setActivePage(1);
  };

  const startIndex = (activePage - 1) * viewCount;
  const endIndex = startIndex + viewCount;
  const paginatedProducts = products.slice(startIndex, endIndex);

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-transparent bg-white p-4 shadow-none sm:p-6 dark:border-white/[0.06] dark:bg-[#0a0e27]">
      <Table>
        <ProductTableHeader />
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
      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
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

export default ProductTable;

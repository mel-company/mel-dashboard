import { useState } from "react";
import {

  TableBody,
  Table,
} from "@/components/ui/table";
import type { ProductListItem } from "@/api/types/product";

import Pagination from "@/components/table/pagination";
import ProductRow from "./row";
import ProductTableHeader from "./header";

interface ProductTableProps {
  products: ProductListItem[];
  onDelete: (id: string) => void;
}

const ProductTable = ({ products, onDelete }: ProductTableProps) => {

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
    <div className="overflow-hidden shadow-none p-6 bg-white w-full rounded-3xl">
      <Table>
        <ProductTableHeader />
        <TableBody>
          {paginatedProducts.map((product, index) => <ProductRow key={index} product={product} onDelete={onDelete} />)}
        </TableBody>
      </Table>
      <Pagination
        totalPages={totalPages}
        activePage={activePage}
        viewCount={viewCount}
        onPageChange={handlePageChange}
        onViewCountChange={handleViewCountChange}
      />
    </div>
  );
};

export default ProductTable;

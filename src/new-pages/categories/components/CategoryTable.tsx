import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Folder,
  CheckCircle2,
  Package,
  Edit,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Pagination from "@/components/table/pagination";

interface CategoryTableProps {
  categories: any[];
  imageBaseUrl: string;
}

const CategoryTable = ({ categories, imageBaseUrl }: CategoryTableProps) => {
  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);

  const totalPages = Math.ceil(categories.length / viewCount) || 1;

  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  const handleViewCountChange = (count: number) => {
    setViewCount(count);
    setActivePage(1);
  };

  const startIndex = (activePage - 1) * viewCount;
  const endIndex = startIndex + viewCount;
  const paginatedCategories = categories.slice(startIndex, endIndex);

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-right font-semibold text-gray-700">اسم الفئة</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">الوصف</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">عدد المنتجات</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.map((category: any) => (
              <CategoryTableRow 
                key={category.id} 
                category={category} 
                imageBaseUrl={imageBaseUrl} 
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t">
        <Pagination
          totalPages={totalPages}
          activePage={activePage}
          viewCount={viewCount}
          onPageChange={handlePageChange}
          onViewCountChange={handleViewCountChange}
        />
      </div>
    </Card>
  );
};

const CategoryTableRow = ({ category, imageBaseUrl }: { category: any; imageBaseUrl: string }) => {
  return (
    <TableRow className={cn(
      "hover:bg-gray-50 cursor-pointer transition-all duration-200",
      "border-b border-gray-100"
    )}>
      <TableCell>
        <div className="flex items-center gap-3">
          {category.image ? (
            <img
              src={`${imageBaseUrl}/${category.image}`}
              alt={category.name}
              className="w-12 h-12 object-cover rounded-lg"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = `https://via.placeholder.com/48x48/cccccc/666666?text=${encodeURIComponent(
                  category.name,
                )}`;
                target.onerror = null;
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
              <Folder className="size-6 text-white" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{category.name}</div>
            <div className="text-sm text-gray-500">#{String(category.id).slice(0, 8)}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-600 max-w-xs">
          {category.description || "لا يوجد وصف"}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Package className="size-4 text-blue-500" />
          <span className="font-medium text-gray-700">
            {category._count?.products ?? 0}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="default"
          className={cn(
            "border font-medium flex items-center gap-1 px-3 py-1",
            category.enabled
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200"
          )}
        >
          {category.enabled ? (
            <>
              <CheckCircle2 className="size-3" />
              مفعّل
            </>
          ) : (
            "معطّل"
          )}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <Eye className="size-4" />
            عرض
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <Edit className="size-4" />
            تعديل
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CategoryTable;

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Folder,
  Edit,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Pagination from "@/components/table/pagination";
import { getImageUrl } from "@/utils/image-url";
import { Switch } from "@/components/ui/switch";

import axiosInstance from "@/utils/AxiosInstance";

interface CategoryTableProps {
  categories: any[];
  refetch: () => void;
}

const CategoryTable = ({ categories, refetch }: CategoryTableProps) => {
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
              <TableHead className="text-right font-semibold text-gray-700"></TableHead>
              <TableHead className="text-right font-semibold text-gray-700">الصورة</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">معلومات الفئات</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">المعرف</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">الكمية</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">نوع الفئة</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">العمليات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.map((category: any) => (
              <CategoryTableRow
                key={category.id}
                category={category}
                refetch={refetch}
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

const CategoryTableRow = ({ category, refetch }: { category: any; refetch: () => void; }) => {

  const [data, setData] = useState(category)

  const handleUpdate = async () => {
    setData({ ...data, enabled: !data.enabled })
    await axiosInstance.put(`${import.meta.env.VITE_PUBLIC_URL}/category/${category.id}`, {
      enabled: !category.enabled
    })
    refetch()
  }
  return (
    <TableRow className={cn(
      "hover:bg-gray-50 cursor-pointer transition-all duration-200",
      "border-b border-gray-100"
    )}>
      <TableCell>
        <div className="w-8 text-center">
          <span>1</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="bg-slate-100 h-10 w-10 aspect-square rounded-lg">
          {data.image ? (
            <img
              src={getImageUrl(data.image)}
              alt={data.name}
              className="w-12 h-12 object-cover rounded-lg"

            />
          ) : (
            <Folder className="size-6 text-slate-600" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">{data.name}</div>
          <div className="text-sm text-gray-500">{data.description || "لا يوجد وصف"}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-600 max-w-xs">
          #{String(data.id).slice(0, 8)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {data._count?.products ?? 0}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          رئيسي
        </div>
      </TableCell>
      <TableCell>
        <Switch onToggle={handleUpdate} checked={data.enabled} activeLabel="مُفعل" disabledLabel="مُعطّل" />
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

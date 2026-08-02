import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import Pagination from "@/components/table/pagination";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import { Switch } from "@/components/ui/switch";

import ActionBtnList from "@/components/table/action-btn-list";
import { useNavigate } from "react-router-dom";
import { useDeleteCategory, useToggleCategoryEnabled } from "@/api/wrappers/category.wrappers";
import { toast } from "sonner";

interface CategoryTableProps {
  categories: any[];
  refetch: () => void;
  imageBaseUrl?: string;
}

const CategoryTable = ({ categories, refetch, imageBaseUrl = "" }: CategoryTableProps) => {
  const [activePage, setActivePage] = useState(1);
  const [viewCount, setViewCount] = useState(10);
  const [deleteModalCategory, setDeleteModalCategory] = useState<any>(null);
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const totalPages = Math.ceil(categories.length / viewCount) || 1;

  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  const handleViewCountChange = (count: number) => {
    setViewCount(count);
    setActivePage(1);
  };

  const handleDeleteModal = (category: any) => {
    setDeleteModalCategory(category);
  };

  const handleConfirmDelete = () => {
    if (!deleteModalCategory?.id) return;
    deleteCategory(deleteModalCategory.id, {
      onSuccess: () => {
        toast.success("تم حذف الفئة بنجاح");
        setDeleteModalCategory(null);
        refetch();
      },
      onError: () => toast.error("فشل حذف الفئة"),
    });
  };

  const startIndex = (activePage - 1) * viewCount;
  const endIndex = startIndex + viewCount;
  const paginatedCategories = categories.slice(startIndex, endIndex);

  return (
    <Card className="overflow-hidden border-0 shadow-lg dark:border dark:border-slate-800">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-slate-900">
            <TableRow>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200"></TableHead>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">الصورة</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">معلومات الفئات</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">المعرف</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">الكمية</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">نوع الفئة</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">الحالة</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">العمليات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.map((category: any) => (
              <CategoryTableRow
                key={category.id}
                category={category}
                refetch={refetch}
                onDeleteModal={handleDeleteModal}
                imageBaseUrl={imageBaseUrl}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <Pagination
          totalPages={totalPages}
          activePage={activePage}
          viewCount={viewCount}
          onPageChange={handlePageChange}
          onViewCountChange={handleViewCountChange}
        />
      </div>
      <Dialog
        open={!!deleteModalCategory}
        onOpenChange={(open) => !open && setDeleteModalCategory(null)}
      >
        <DialogContent className="text-right sm:max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle>حذف الفئة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف &quot;{deleteModalCategory?.name}&quot;؟ لا يمكن
              التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteModalCategory(null)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const CategoryTableRow = ({ category, refetch, onDeleteModal, imageBaseUrl = "" }: {
  category: any;
  refetch: () => void;
  onDeleteModal: (category: any) => void;
  imageBaseUrl?: string;
}) => {

  const [data, setData] = useState(category)
  const navigate = useNavigate()
  const resolvedBaseUrl = useImageBaseUrl(imageBaseUrl)
  const { mutate: toggleEnabled } = useToggleCategoryEnabled()

  useEffect(() => {
    setData(category)
  }, [category])

  const handleUpdate = () => {
    const nextEnabled = !data.enabled
    setData({ ...data, enabled: nextEnabled })
    toggleEnabled(category.id, {
      onSuccess: () => refetch(),
      onError: () => {
        setData(category)
        toast.error("فشل تحديث حالة الفئة")
      },
    })
  }

  return (
    <TableRow className={cn(
      "cursor-pointer border-b border-gray-100 transition-colors duration-200",
      "hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/80",
    )}>
      <TableCell>
        <div className="w-8 text-center text-slate-700 dark:text-slate-300">
          <span>1</span>
        </div>
      </TableCell>
      <TableCell className="w-16">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
          <AssetImage
            image={data.image}
            baseUrl={resolvedBaseUrl}
            alt={data.name}
            className="block h-12 w-12 rounded-lg object-cover"
            fallback={<Folder className="size-6 text-slate-600 dark:text-slate-400" />}
          />
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium text-gray-900 dark:text-slate-100">{data.name}</div>
          <div className="text-sm text-gray-500 dark:text-slate-400">{data.description || "لا يوجد وصف"}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-xs text-sm text-gray-600 dark:text-slate-400">
          #{String(data.id).slice(0, 8)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          {data._count?.products ?? 0}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          رئيسي
        </div>
      </TableCell>
      <TableCell>
        <Switch onToggle={handleUpdate} checked={data.enabled} activeLabel="مُفعل" disabledLabel="مُعطّل" />
      </TableCell>
      <TableCell>
        <ActionBtnList
          onDelete={() => onDeleteModal(category)}
          onEdit={() => navigate(`/categories/${category.id}/edit`)}
          onView={() => navigate(`/categories/${category.id}`)}
        />
      </TableCell>
    </TableRow>
  );
};

export default CategoryTable;

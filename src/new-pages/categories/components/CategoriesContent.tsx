import { Folder, Plus, X } from "lucide-react";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import CategoriesSkeleton from "@/pages/category/CategoriesSkeleton";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import CategoryTable from "./CategoryTable";
import CategoryCards from "./CategoryCards";
import CategoryDeleteModal from "./CategoryDeleteModal";
import { useState } from "react";

interface CategoriesContentProps {
  actions: any;
}

const CategoriesContent = ({ actions }: CategoriesContentProps) => {
  const [deleteCategory, setDeleteCategory] = useState<any>(null);

  if (actions.isLoading && actions.categories.length === 0) {
    return <CategoriesSkeleton count={8} showHeader={false} />;
  }

  if (actions.error && actions.categories.length === 0) {
    return (
      <ErrorPage
        error={actions.error}
        onRetry={() => actions.refetch()}
        isRetrying={false}
      />
    );
  }

  if (actions.categories.length === 0) {
    return <EmptyCard actions={actions} />;
  }

  const cards = (
    <CategoryCards
      categories={actions.categories}
      imageBaseUrl={actions.imageBaseUrl}
      onDelete={setDeleteCategory}
      refetch={actions.refetch}
    />
  );

  const totalCount = actions.categories.length;

  return (
    <>
      <div className="rounded-[28px] bg-slate-50 p-3 dark:bg-[#12183b] xl:hidden">
        <div className="mb-2 px-2 pt-1 text-right">
          <h2 className="text-base text-slate-900 dark:text-[#e4e7fc]">
            جميع الفئات
          </h2>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-[#a4b1fa]">
            أجمالي العناصر المتاحة{" "}
            <span className="font-bold text-slate-800 dark:text-[#e4e7fc]">
              {totalCount}
            </span>
          </p>
        </div>
        {cards}
      </div>
      <div className="hidden xl:block">
        {actions.viewMode === "table" ? (
          <CategoryTable
            categories={actions.categories}
            refetch={actions.refetch}
            imageBaseUrl={actions.imageBaseUrl}
          />
        ) : (
          cards
        )}
      </div>
      <CategoryDeleteModal
        category={deleteCategory}
        onOpenChange={(open) => !open && setDeleteCategory(null)}
        onSuccess={actions.refetch}
        imageBaseUrl={actions.imageBaseUrl}
      />
    </>
  );
};

export default CategoriesContent;

const EmptyCard = ({ actions }: { actions: any }) => {
  const hasFilters = actions.search || actions.hasActiveFilters;

  const handleAdd = () => {
    if (typeof actions.setIsAddDialogOpen === "function") {
      actions.setIsAddDialogOpen(true);
      return;
    }
    actions.setIsFilterDialogOpen(true);
  };

  const primaryAction = hasFilters
    ? {
        label: "مسح البحث والتصفية",
        onClick: () => {
          actions.setSearchValue("");
          actions.handleClearFilters();
        },
        icon: <X className="size-4" />,
        variant: "secondary" as const,
      }
    : {
        label: "إضافة فئة",
        onClick: handleAdd,
        icon: <Plus className="size-4" />,
      };

  return (
    <EmptyPage
      title={hasFilters ? "لا توجد نتائج" : "لا توجد فئات"}
      description={
        hasFilters
          ? "لم يتم العثور على فئات تطابق البحث أو التصفية."
          : "ابدأ بإضافة فئة جديدة لعرضها هنا."
      }
      icon={<Folder className="size-7 text-muted-foreground" />}
      primaryAction={primaryAction}
    />
  );
};

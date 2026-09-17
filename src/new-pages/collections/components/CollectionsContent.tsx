import { useState } from "react";
import { Layers, Plus, X } from "lucide-react";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import CategoriesSkeleton from "@/pages/category/CategoriesSkeleton";
import CollectionTable from "./CollectionTable";
import CollectionCards from "./CollectionCards";
import CollectionDeleteModal from "./CollectionDeleteModal";

interface CollectionsContentProps {
  actions: any;
}

const CollectionsContent = ({ actions }: CollectionsContentProps) => {
  const [deleteCollection, setDeleteCollection] = useState<any>(null);

  if (actions.isLoading && actions.collections.length === 0) {
    return <CategoriesSkeleton count={6} showHeader={false} />;
  }

  if (actions.error && actions.collections.length === 0) {
    return (
      <ErrorPage
        error={actions.error}
        onRetry={() => actions.refetch()}
        isRetrying={false}
      />
    );
  }

  if (actions.collections.length === 0) {
    return <EmptyCard actions={actions} />;
  }

  const cards = (
    <CollectionCards
      collections={actions.collections}
      imageBaseUrl={actions.imageBaseUrl}
      onDelete={setDeleteCollection}
      refetch={actions.refetch}
    />
  );

  return (
    <>
      <div className="rounded-[28px] bg-slate-50 p-3 dark:bg-[#12183b] xl:hidden">
        <div className="mb-2 px-2 pt-1 text-right">
          <h2 className="text-base text-slate-900 dark:text-[#e4e7fc]">
            جميع المجموعات
          </h2>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-[#a4b1fa]">
            أجمالي المجموعات{" "}
            <span className="font-bold text-slate-800 dark:text-[#e4e7fc]">
              {actions.collections.length}
            </span>
          </p>
        </div>
        {cards}
      </div>
      <div className="hidden xl:block">
        {actions.viewMode === "table" ? (
          <CollectionTable
            collections={actions.collections}
            refetch={actions.refetch}
            onDelete={setDeleteCollection}
            imageBaseUrl={actions.imageBaseUrl}
          />
        ) : (
          cards
        )}
      </div>
      {/* The sentinel the list engine watches to pull the next cursor page. */}
      <div ref={actions.loadMoreRef} className="h-1" />
      <CollectionDeleteModal
        collection={deleteCollection}
        onOpenChange={(open) => !open && setDeleteCollection(null)}
        onSuccess={actions.refetch}
        imageBaseUrl={actions.imageBaseUrl}
      />
    </>
  );
};

export default CollectionsContent;

const EmptyCard = ({ actions }: { actions: any }) => {
  const hasFilters = actions.search || actions.hasActiveFilters;

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
        label: "إضافة مجموعة",
        onClick: () => actions.setIsAddDialogOpen?.(true),
        icon: <Plus className="size-4" />,
      };

  return (
    <EmptyPage
      title={hasFilters ? "لا توجد نتائج" : "لا توجد مجموعات بعد"}
      description={
        hasFilters
          ? "لم يتم العثور على مجموعات تطابق البحث أو التصفية."
          : "المجموعة هي تشكيلة تختارها بنفسك — «صيفي»، «شتوي» — تجمع منتجات من فئات مختلفة وتظهر للزبون كفلتر في صفحة المنتجات."
      }
      icon={<Layers className="size-7 text-muted-foreground" />}
      primaryAction={primaryAction}
    />
  );
};

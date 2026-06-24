import { Link } from "react-router-dom";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Folder,
    CheckCircle2,
    X,
    Plus,
    Loader2,
    TrendingUp,
    Star,
    Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import CategoriesSkeleton from "@/pages/category/CategoriesSkeleton";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import CategoryTable from "./CategoryTable";

interface CategoriesContentProps {
    actions: any;
}

const CategoriesContent = ({ actions }: CategoriesContentProps) => {
    if (actions.isLoading && actions.categories.length === 0) {
        return <CategoriesSkeleton count={8} showHeader={false} />;
    }

    if (actions.error && actions.categories.length === 0) {
        return <ErrorPage error={actions.error} onRetry={() => actions.refetch()} isRetrying={false} />;
    }

    if (actions.categories.length === 0) {
        return <EmptyCard actions={actions} />;
    }

    return actions.viewMode === "table" ? (
        <CategoryTable
            categories={actions.categories}
            imageBaseUrl={actions.imageBaseUrl}
        />
    ) : (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">مكتبة الفئات</h3>
                <p className="text-sm text-gray-600">تصفح وإدارة جميع فئات المنتجات في متجرك</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {actions.categories.map((category: any) => (
                    <CategoryCard key={category.id} category={category} imageBaseUrl={actions.imageBaseUrl} />
                ))}
                <div
                    ref={actions.loadMoreRef}
                    className="col-span-full flex justify-center py-6"
                >
                    {actions.hasNextPage && (
                        <Button
                            variant="outline"
                            className="gap-2 bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                            onClick={() => actions.fetchNextPage()}
                            disabled={actions.isFetchingNextPage}
                        >
                            {actions.isFetchingNextPage ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    جاري التحميل...
                                </>
                            ) : (
                                "تحميل المزيد"
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoriesContent;

const CategoryCard = ({ category, imageBaseUrl }: { category: any; imageBaseUrl: string }) => {
    return (
        <Link key={category.id} to={`/categories/${category.id}`}>
            <Card className={cn(
                "group gap-y-0 h-full cursor-pointer transition-all duration-300",
                "border-0 shadow-lg hover:shadow-xl overflow-hidden",
                "hover:scale-105 hover:border-blue-200"
            )}>
                <CardHeader className="pb-4">
                    <div className="relative h-48 flex items-center justify-center w-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                        {category.image ? (
                            <img
                                src={`${imageBaseUrl}/${category.image}`}
                                alt={category.name}
                                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    target.src = `https://via.placeholder.com/300x300/cccccc/666666?text=${encodeURIComponent(
                                        category.name,
                                    )}`;
                                    target.onerror = null;
                                }}
                            />
                        ) : (
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                                <Folder className="size-10 text-white" />
                            </div>
                        )}
                        <div className="absolute top-2 left-2">
                            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                                <Star className="size-4 text-yellow-500" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                    <div className="space-y-2">
                        <CardTitle className="line-clamp-1 text-right text-lg font-semibold text-gray-900">
                            {category.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-2 text-right">
                            {category.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {category.enabled ? (
                            <Badge
                                variant="default"
                                className="bg-green-100 text-green-800 border-green-200 gap-1 text-sm font-medium"
                            >
                                <CheckCircle2 className="size-3" />
                                مفعّل
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="bg-red-100 text-red-800 border-red-200 text-sm font-medium"
                            >
                                معطّل
                            </Badge>
                        )}
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Package className="size-3 mr-1" />
                            {category._count?.products ?? 0} منتج
                        </Badge>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="size-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">
                            نشط
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    >
                        عرض التفاصيل
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}

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
            label: "إضافة فئة",
            onClick: () => actions.setIsFilterDialogOpen(true),
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
}

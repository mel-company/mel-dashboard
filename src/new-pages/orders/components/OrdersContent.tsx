import { Link } from "react-router-dom";
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
    Package,
    User,
    MapPin,
    Calendar,
    FileText,
    X,
    Loader2,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import OrderFilterDialog from "@/pages/order/OrderFilterDialog";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import OrdersSkeleton from "@/pages/order/OrdersSkeleton";

interface OrdersContentProps {
    actions: any;
    navigate: (path: string) => void;
}

const OrdersContent = ({ actions }: OrdersContentProps) => {
    if (actions.isLoading && actions.orders.length === 0) {
        return <OrdersSkeleton showHeader={false} rows={6} />;
    }

    if (actions.error && actions.orders.length === 0) {
        return <ErrorPage error={actions.error} onRetry={() => actions.refetch()} isRetrying={false} />;
    }

    if (actions.orders.length === 0) {
        return <EmptyCard actions={actions} />;
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ar-IQ", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Get status badge with modern design
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { className: string; text: string; icon: React.ReactNode }> = {
            PENDING: {
                className: "border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
                text: "قيد الانتظار",
                icon: <Clock className="size-3" />
            },
            PROCESSING: {
                className: "border-blue-200 bg-blue-100 text-blue-800 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300",
                text: "قيد المعالجة",
                icon: <TrendingUp className="size-3" />
            },
            SHIPPED: {
                className: "border-purple-200 bg-purple-100 text-purple-800 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300",
                text: "تم الشحن",
                icon: <Package className="size-3" />
            },
            DELIVERED: {
                className: "border-green-200 bg-green-100 text-green-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
                text: "تم التسليم",
                icon: <CheckCircle className="size-3" />
            },
            CANCELLED: {
                className: "border-red-200 bg-red-100 text-red-800 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300",
                text: "ملغي",
                icon: <TrendingDown className="size-3" />
            },
        };
        return (
            statusMap[status] || {
                className: "border-gray-200 bg-gray-100 text-gray-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
                text: status,
                icon: null
            }
        );
    };

    return (
        <>
            <OrderFilterDialog
                open={actions.isFilterDialogOpen}
                onOpenChange={actions.setIsFilterDialogOpen}
                values={actions.filters}
                onApply={actions.setFilters}
                onClear={actions.handleClearFilters}
            />

            <Card className="overflow-hidden border-0 shadow-lg dark:border dark:border-slate-800">
                <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">قائمة الطلبات</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">إدارة وتتبع جميع طلبات العملاء</p>
                </div>
                <Table>
                    <TableHeader className="bg-gray-50 dark:bg-slate-900">
                        <TableRow>
                            <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">رقم الطلب</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">العميل</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">المنتجات</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">العنوان</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">الحالة</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">المبلغ الإجمالي</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">التاريخ</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-200">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {actions.orders.map((order: any) => {
                            const customer = order.customer?.user;
                            const statusBadge = getStatusBadge(order.status);
                            const total = actions.calculateTotal(order.products ?? []);
                            const productCount =
                                order._count?.products ?? order.products?.length ?? 0;
                            const productTitles = (order.products ?? [])
                                .map(
                                    (p: any) => p.variant?.product?.title ?? p.product?.title,
                                )
                                .filter(Boolean);

                            return (
                                <TableRow
                                    key={order.id}
                                    className={cn(
                                        "cursor-pointer border-b border-gray-100 transition-colors duration-200",
                                        "hover:bg-blue-50/70 dark:border-slate-800 dark:hover:bg-slate-900/80",
                                    )}
                                    onClick={() => actions.navigate(`/orders/${order.id}`)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-md bg-blue-100 px-2 py-1 font-mono text-sm text-blue-800 dark:bg-sky-500/15 dark:text-sky-300">
                                                #{String(order.id).slice(0, 8)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {customer ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-indigo-400">
                                                        <User className="size-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-900 dark:text-slate-100">
                                                            {customer.name ?? "—"}
                                                        </span>
                                                        {customer.phone && (
                                                            <div className="text-sm text-gray-600 dark:text-slate-400">
                                                                {customer.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {customer.email && !customer.phone && (
                                                    <div className="text-sm text-gray-600 dark:text-slate-400">
                                                        {customer.email}
                                                    </div>
                                                )}
                                                {customer.location && (
                                                    <div className="flex items-center gap-1 rounded bg-gray-50 p-2 text-xs text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                                                        <MapPin className="size-3 shrink-0" />
                                                        {customer.location}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="rounded bg-gray-100 px-2 py-1 text-gray-500 dark:bg-slate-800 dark:text-slate-400">
                                                غير معروف
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-400">
                                                    <Package className="size-4 text-white" />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900 dark:text-slate-100">
                                                        {productCount} منتج
                                                    </span>
                                                    {productTitles.length > 0 && (
                                                        <div className="max-w-xs rounded bg-gray-50 p-1 text-xs text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                                                            {productTitles.slice(0, 2).join(", ")}
                                                            {productTitles.length > 2 ? ", ..." : ""}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {order.deliveryAddress ? (
                                            <div className="max-w-xs text-sm text-slate-700 dark:text-slate-300">
                                                {order.deliveryAddress}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="default"
                                            className={cn(
                                                "flex items-center gap-1 border px-3 py-1 font-medium",
                                                statusBadge.className
                                            )}
                                        >
                                            {statusBadge.icon}
                                            {statusBadge.text}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-green-600 dark:text-emerald-400">
                                                {total.toLocaleString("ar-IQ")}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-slate-400">IQD</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 rounded bg-gray-50 p-2 text-sm dark:bg-slate-800">
                                            <Calendar className="size-4 text-blue-500 dark:text-sky-400" />
                                            <span className="text-gray-700 dark:text-slate-200">{formatDate(order.createdAt)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Link to={`/orders/${order.id}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 border-blue-200 bg-white text-blue-600 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 dark:border-sky-800 dark:bg-slate-900 dark:text-sky-300 dark:hover:border-sky-700 dark:hover:bg-sky-500/10"
                                            >
                                                <FileText className="size-4" />
                                                التفاصيل
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>
            <div ref={actions.loadMoreRef} className="flex justify-center py-6">
                {actions.hasNextPage && (
                    <Button
                        variant="secondary"
                        className="gap-2"
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
        </>
    );
};

export default OrdersContent;

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
        : undefined;

    return (
        <EmptyPage
            title={hasFilters ? "لا توجد نتائج" : "لا توجد طلبات"}
            description={
                hasFilters
                    ? "لم يتم العثور على طلبات تطابق البحث أو التصفية."
                    : "لم يتم العثور على طلبات."
            }
            icon={<Package className="size-7 text-muted-foreground" />}
            primaryAction={primaryAction}
        />
    );
}

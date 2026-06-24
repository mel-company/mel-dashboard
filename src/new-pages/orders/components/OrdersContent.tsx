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
                className: "bg-yellow-100 text-yellow-800 border-yellow-200",
                text: "قيد الانتظار",
                icon: <Clock className="size-3" />
            },
            PROCESSING: {
                className: "bg-blue-100 text-blue-800 border-blue-200",
                text: "قيد المعالجة",
                icon: <TrendingUp className="size-3" />
            },
            SHIPPED: {
                className: "bg-purple-100 text-purple-800 border-purple-200",
                text: "تم الشحن",
                icon: <Package className="size-3" />
            },
            DELIVERED: {
                className: "bg-green-100 text-green-800 border-green-200",
                text: "تم التسليم",
                icon: <CheckCircle className="size-3" />
            },
            CANCELLED: {
                className: "bg-red-100 text-red-800 border-red-200",
                text: "ملغي",
                icon: <TrendingDown className="size-3" />
            },
        };
        return (
            statusMap[status] || {
                className: "bg-gray-100 text-gray-800 border-gray-200",
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

            <Card className="border-0 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">قائمة الطلبات</h3>
                    <p className="text-sm text-gray-600 mt-1">إدارة وتتبع جميع طلبات العملاء</p>
                </div>
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="text-right font-semibold text-gray-700">رقم الطلب</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">العميل</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">المنتجات</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">العنوان</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">المبلغ الإجمالي</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">التاريخ</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">الإجراءات</TableHead>
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
                                        "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200",
                                        "border-b border-gray-100"
                                    )}
                                    onClick={() => actions.navigate(`/orders/${order.id}`)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-mono">
                                                #{String(order.id).slice(0, 8)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {customer ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                                                        <User className="size-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-900">
                                                            {customer.name ?? "—"}
                                                        </span>
                                                        {customer.phone && (
                                                            <div className="text-sm text-gray-600">
                                                                {customer.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {customer.email && !customer.phone && (
                                                    <div className="text-sm text-gray-600">
                                                        {customer.email}
                                                    </div>
                                                )}
                                                {customer.location && (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 p-2 rounded">
                                                        <MapPin className="size-3" />
                                                        {customer.location}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                غير معروف
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                                                    <Package className="size-4 text-white" />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900">
                                                        {productCount} منتج
                                                    </span>
                                                    {productTitles.length > 0 && (
                                                        <div className="text-xs text-gray-600 max-w-xs bg-gray-50 p-1 rounded">
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
                                            <div className="text-sm max-w-xs">
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
                                                "border font-medium flex items-center gap-1 px-3 py-1",
                                                statusBadge.className
                                            )}
                                        >
                                            {statusBadge.icon}
                                            {statusBadge.text}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-green-600">
                                                {total.toLocaleString("ar-IQ")}
                                            </span>
                                            <span className="text-sm text-gray-500">IQD</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                                            <Calendar className="size-4 text-blue-500" />
                                            <span className="text-gray-700">{formatDate(order.createdAt)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Link to={`/orders/${order.id}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
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

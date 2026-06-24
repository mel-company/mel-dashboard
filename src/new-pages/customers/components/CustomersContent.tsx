import { Link } from "react-router-dom";
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
    User,
    MapPin,
    Phone,
    ShoppingBag,
    FileText,
    X,
    Loader2,
    Star,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import CustomersSkeleton from "@/pages/customer/CustomersSkeleton";

interface CustomersContentProps {
    actions: any;
    navigate: (path: string) => void;
}

const CustomersContent = ({ actions }: CustomersContentProps) => {
    if (actions.isLoading && actions.customers.length === 0) {
        return <CustomersSkeleton showHeader={false} rows={6} />;
    }

    if (actions.error && actions.customers.length === 0) {
        return <ErrorPage error={actions.error} onRetry={() => actions.refetch()} isRetrying={false} />;
    }

    if (actions.customers.length === 0) {
        return <EmptyCard actions={actions} />;
    }

    return (
        <>
            <Card className="border-0 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">قائمة العملاء</h3>
                    <p className="text-sm text-gray-600 mt-1">إدارة وتتبع جميع عملاء المتجر</p>
                </div>
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="text-right font-semibold text-gray-700">رقم العميل</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">الاسم</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">رقم الهاتف</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">الموقع</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">عدد الطلبات</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {actions.customers.map((customer: any) => {
                            const orderCount = customer._count?.orders ?? 0;
                            const user = customer.user;
                            const customerId = customer.id;

                            return (
                                <TableRow
                                    key={customerId}
                                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => actions.navigate(`/customers/${customerId}`)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-mono">
                                                #{customerId.slice(0, 8)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                                                <User className="size-5 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="font-medium text-gray-900 text-base">
                                                    {user?.name ?? "—"}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="size-3 text-yellow-500 fill-current" />
                                                    <span className="text-xs text-gray-600">عميل نشط</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                                            <Phone className="size-4 text-green-600" />
                                            <span className="text-sm font-medium text-gray-700">{user?.phone ?? "—"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 max-w-xs">
                                            <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                                                <MapPin className="size-4 text-orange-600" />
                                            </div>
                                            <span className="text-sm text-gray-700 line-clamp-1">
                                                {user?.location ?? "—"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                <ShoppingBag className="size-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-purple-700">
                                                    {orderCount}
                                                </span>
                                                <span className="text-xs text-purple-600 mr-1">
                                                    {orderCount === 1 ? "طلب" : "طلبات"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Link to={`/customers/${customerId}`}>
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

export default CustomersContent;

const EmptyCard = ({ actions }: { actions: any }) => {
    const hasSearch = actions.search;
    const primaryAction = hasSearch
        ? {
            label: "مسح البحث",
            onClick: () => actions.setSearchValue(""),
            icon: <X className="size-4" />,
            variant: "outline" as const,
        }
        : undefined;

    return (
        <EmptyPage
            title={hasSearch ? "لا توجد نتائج" : "لا يوجد عملاء"}
            description={
                hasSearch
                    ? "لم يتم العثور على عملاء يطابقون البحث"
                    : "ابدأ بإضافة عميل جديد"
            }
            icon={<User className="size-7 text-muted-foreground" />}
            primaryAction={primaryAction}
        />
    );
}

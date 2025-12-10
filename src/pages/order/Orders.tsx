import { useState } from "react";
import { Link } from "react-router-dom";
import { dmy_orders, dmy_users } from "@/data/dummy";
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
  Search,
  Plus,
  Package,
  User,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";

type Props = {};

const Orders = ({}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Get user by ID
  const getUserById = (userId: number) => {
    return dmy_users.find((user) => user.id === userId);
  };

  // Calculate total price for order
  const calculateTotal = (products: (typeof dmy_orders)[0]["products"]) => {
    return products.reduce((sum, product) => sum + product.price, 0);
  };

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

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string; text: string }> = {
      pending: { className: "bg-yellow-600 text-white", text: "قيد الانتظار" },
      processing: { className: "bg-blue-600 text-white", text: "قيد المعالجة" },
      shipped: { className: "bg-purple-600 text-white", text: "تم الشحن" },
      delivered: { className: "bg-green-600 text-white", text: "تم التسليم" },
      cancelled: { className: "bg-red-600 text-white", text: "ملغي" },
    };
    return (
      statusMap[status] || { className: "bg-gray-600 text-white", text: status }
    );
  };

  // Filter orders based on search query
  const filteredOrders = dmy_orders.filter((order) => {
    const user = getUserById(order.user_id);
    const searchLower = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(searchLower) ||
      user?.name.toLowerCase().includes(searchLower) ||
      user?.phone.includes(searchLower) ||
      user?.location.toLowerCase().includes(searchLower) ||
      order.address.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower) ||
      order.products.some((p) => p.title.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and Add Order Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="ابحث عن طلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right rounded-md border border-input bg-background py-2 pr-10 pl-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
          />
        </div>
        <Button className="gap-2" onClick={() => {}}>
          <Plus className="size-4" />
          إضافة طلب
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم الطلب</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">المنتجات</TableHead>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">المبلغ الإجمالي</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="size-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground">
                      لا توجد طلبات
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchQuery
                        ? "لم يتم العثور على طلبات تطابق البحث"
                        : "ابدأ بإضافة طلب جديد"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const user = getUserById(order.user_id);
                const statusBadge = getStatusBadge(order.status);
                const total = calculateTotal(order.products);

                return (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      {user ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            <span className="font-medium">{user.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.phone}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="size-3" />
                            {user.location}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">غير معروف</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Package className="size-4 text-muted-foreground" />
                          <span className="font-medium">
                            {order.products.length} منتج
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground max-w-xs">
                          {order.products
                            .map((p) => p.title)
                            .slice(0, 2)
                            .join("، ")}
                          {order.products.length > 2 && "..."}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-xs">
                        <MapPin className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm line-clamp-2">
                          {order.address}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={`${statusBadge.className} text-sm`}
                      >
                        {statusBadge.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {total.toFixed(2)} د.ع
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="size-4" />
                          التفاصيل
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Orders;

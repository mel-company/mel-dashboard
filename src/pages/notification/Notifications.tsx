import { useState } from "react";
import { Link } from "react-router-dom";
import { dmy_notifications } from "@/data/dummy";
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
  Bell,
  Clock,
  MessageSquare,
  FileText,
  CheckCircle2,
  Circle,
} from "lucide-react";

type Props = {};

const Notifications = ({}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Format date to Arabic format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get type label in Arabic
  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      order: "طلب",
      order_status: "حالة الطلب",
      discount: "خصم",
      user: "عميل",
      inventory: "مخزون",
      system: "نظام",
      employee: "موظف",
      alert: "تنبيه",
    };
    return typeMap[type] || type;
  };

  // Filter notifications based on search query
  const filteredNotifications = dmy_notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTypeLabel(notification.type)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Add Notification Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="ابحث عن إشعار..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right rounded-md border border-input bg-background py-2 pr-10 pl-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
          />
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => {}}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">إضافة إشعار</span>
          <span className="sm:hidden">إضافة</span>
        </Button>
      </div>

      {/* Notifications Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم الإشعار</TableHead>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">الرسالة</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Bell className="size-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground">
                      لا يوجد إشعارات
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchQuery
                        ? "لم يتم العثور على إشعارات تطابق البحث"
                        : "ابدأ بإضافة إشعار جديد"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification) => {
                return (
                  <TableRow
                    key={notification.id}
                    className={`hover:bg-muted/50 ${
                      !notification.read
                        ? "bg-blue-50/50 dark:bg-blue-950/20"
                        : ""
                    }`}
                  >
                    <TableCell className="font-medium">
                      #{notification.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bell className="size-4 text-muted-foreground" />
                        <span className="font-medium">
                          {notification.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-xs">
                        <MessageSquare className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm line-clamp-2">
                          {notification.message}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {getTypeLabel(notification.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={notification.read ? "secondary" : "default"}
                        className="gap-1"
                      >
                        {notification.read ? (
                          <>
                            <CheckCircle2 className="size-3" />
                            مقروء
                          </>
                        ) : (
                          <>
                            <Circle className="size-3" />
                            غير مقروء
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/notifications/${notification.id}`}>
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

export default Notifications;

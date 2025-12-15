import { useParams } from "react-router-dom";
import { dmy_notifications } from "@/data/dummy";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";

const NotificationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const notification = dmy_notifications.find((n) => n.id === Number(id));

  if (!notification) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">الإشعار غير موجود</h2>
        <p className="text-muted-foreground mb-4">
          الإشعار الذي تبحث عنه غير موجود أو تم حذفه.
        </p>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      order: "bg-blue-600 text-white",
      order_status: "bg-purple-600 text-white",
      discount: "bg-green-600 text-white",
      user: "bg-cyan-600 text-white",
      inventory: "bg-orange-600 text-white",
      system: "bg-gray-600 text-white",
      employee: "bg-indigo-600 text-white",
      alert: "bg-red-600 text-white",
    };
    return colorMap[type] || "bg-gray-600 text-white";
  };

  return (
    <div className="space-y-6">
    

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Notification Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-right">
                  {notification.title}  
                </CardTitle>
                <Badge
                  variant={notification.read ? "secondary" : "default"}
                  className="gap-1 text-sm"
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
              </div>
              <CardDescription className="text-right mt-2">
                إشعار رقم #{notification.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-64 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                <Bell className="size-24 text-white bg-cyan/40 rounded-full p-6" />
              </div>

              <Separator />

              {/* Notification Message */}
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <MessageSquare className="size-5 text-primary mt-1 shrink-0" />
                  <div className="text-right flex-1">
                    <p className="text-sm text-muted-foreground mb-2">الرسالة</p>
                    <p className="text-lg leading-relaxed">{notification.message}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notification Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Calendar className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">التاريخ والوقت</p>
                    <p className="text-lg font-bold">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <FileText className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">النوع</p>
                    <Badge
                      variant="default"
                      className={`${getTypeBadgeColor(notification.type)} gap-1 text-sm`}
                    >
                      {getTypeLabel(notification.type)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">معلومات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-sm">
                  #{notification.id}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم الإشعار
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Badge
                  variant="default"
                  className={`${getTypeBadgeColor(notification.type)} gap-1 text-sm`}
                >
                  {getTypeLabel(notification.type)}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  النوع
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Badge
                  variant={notification.read ? "secondary" : "default"}
                  className="gap-1 text-sm"
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
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الحالة
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  التاريخ
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!notification.read && (
                <Button className="w-full gap-2" variant="default">
                  <CheckCircle2 className="size-4" />
                  وضع علامة كمقروء
                </Button>
              )}
              {notification.read && (
                <Button className="w-full gap-2" variant="outline">
                  <Circle className="size-4" />
                  وضع علامة كغير مقروء
                </Button>
              )}
              <Button className="w-full gap-2" variant="outline">
                <Edit className="size-4" />
                تعديل الإشعار
              </Button>
              <Button className="w-full gap-2" variant="destructive">
                <Trash2 className="size-4" />
                حذف الإشعار
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;

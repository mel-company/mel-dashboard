import { useParams, useNavigate } from "react-router-dom";
import { useFetchNotification } from "@/api/wrappers/notification.wrappers";
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
  Users,
  Store,
  User,
} from "lucide-react";
import NotificationDetailsSkeleton from "./NotificationDetailsSkeleton";
import ErrorPage from "../miscellaneous/ErrorPage";
import NotFoundPage from "../miscellaneous/NotFoundPage";
import { useDeleteNotification } from "@/api/wrappers/notification.wrappers";
import { toast } from "sonner";

const NotificationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: notification,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchNotification(id ?? "", !!id);

  console.log(notification);

  const { mutate: deleteNotification, isPending: isDeleting } =
    useDeleteNotification();

  const handleDelete = () => {
    if (!id) return;

    deleteNotification(id, {
      onSuccess: () => {
        toast.success("تم حذف الإشعار بنجاح");
        navigate("/notifications", { replace: true });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في حذف الإشعار. حاول مرة أخرى."
        );
      },
    });
  };

  if (isLoading) return <NotificationDetailsSkeleton />;

  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!notification) {
    return (
      <NotFoundPage
        title="الإشعار غير موجود"
        description="الإشعار الذي تبحث عنه غير موجود أو تم حذفه."
        backTo="/notifications"
        backLabel="العودة إلى الإشعارات"
      />
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

  const isRead = notification.isRead;
  const isPinned = notification.isPinned;

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
                  {notification.title || "بدون عنوان"}
                </CardTitle>
                <Badge
                  variant={isRead ? "secondary" : "default"}
                  className="gap-1 text-sm"
                >
                  {isRead ? (
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
                إشعار رقم #{notification.id.slice(0, 8)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-64 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                {notification.image ? (
                  <img
                    src={notification.image}
                    alt={notification.title || "Notification"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Bell className="size-24 text-white bg-cyan/40 rounded-full p-6" />
                )}
              </div>

              <Separator />

              {/* Notification Message */}
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <MessageSquare className="size-5 text-primary mt-1 shrink-0" />
                  <div className="text-right flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      الرسالة
                    </p>
                    <p className="text-lg leading-relaxed">
                      {notification.message || "لا توجد رسالة"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notification Details */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Calendar className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      التاريخ والوقت
                    </p>
                    <p className="text-lg font-bold">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Users className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">المستلمين</p>
                    <Badge variant="default" className="gap-1 text-sm">
                      {recipientCount} مستلم
                    </Badge>
                  </div>
                </div>
              </div> */}

              {/* Store and Sender Info */}
              {/* {(notification.store || notification.sender) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {notification.store && (
                      <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <Store className="size-5 text-primary" />
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            المتجر
                          </p>
                          <p className="text-lg font-bold">
                            {notification.store.name}
                          </p>
                        </div>
                      </div>
                    )}
                    {notification.sender && (
                      <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <User className="size-5 text-primary" />
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            المرسل
                          </p>
                          <p className="text-lg font-bold">
                            {notification.sender.user?.name || "غير معروف"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )} */}
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
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم الإشعار
                </span>
                <Badge variant="secondary" className="text-sm">
                  #{notification.id.slice(0, 8)}
                </Badge>
              </div>
              {/* <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  المستلمين
                </span>
                <Badge variant="default" className="gap-1 text-sm">
                  {recipientCount} مستلم
                </Badge>
              </div> */}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الحالة
                </span>
                <Badge
                  variant={isRead ? "secondary" : "default"}
                  className="gap-1 text-sm"
                >
                  {isRead ? (
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
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  التاريخ
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* {!isRead && (
                <Button className="w-full gap-2" variant="default" disabled>
                  <CheckCircle2 className="size-4" />
                  وضع علامة كمقروء
                </Button>
              )}
              {isRead && (
                <Button className="w-full gap-2" variant="outline" disabled>
                  <Circle className="size-4" />
                  وضع علامة كغير مقروء
                </Button>
              )} */}
              <Button className="w-full gap-2" variant="secondary" disabled>
                <Edit className="size-4" />
                تعديل الإشعار
              </Button>
              <Button
                className="w-full gap-2"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="size-4" />
                {isDeleting ? "جاري الحذف..." : "حذف الإشعار"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;

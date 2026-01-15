import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
import { User, Mail, Edit, Shield, Settings, Phone } from "lucide-react";
import { useLogout, useMe } from "@/api/wrappers/auth.wrappers";
import { toast } from "sonner";
import EditProfileDialog from "./EditProfileDialog";
import LogoutDialog from "./LogoutDialog";

const UserProfile = () => {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { mutate: logoutMutation } = useLogout();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    logoutMutation(
      {},
      {
        onSuccess: () => {
          toast.success("تم تسجيل الخروج بنجاح");
          navigate("/login", { replace: true });
        },
        onError: () => {
          toast.error("حدث خطأ أثناء تسجيل الخروج");
        },
      }
    );
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">غير مسجل الدخول</h2>
        <p className="text-muted-foreground mb-4">
          يرجى تسجيل الدخول لعرض الملف الشخصي.
        </p>
        <Button onClick={() => navigate("/login")} variant="outline">
          تسجيل الدخول
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-right">الملف الشخصي</h1>
          <p className="text-muted-foreground text-right mt-1">
            إدارة معلومات حسابك الشخصي
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-right">{user.name}</CardTitle>
              <CardDescription className="text-right">
                حساب المستخدم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-64 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                <User className="size-24 text-white bg-cyan/40 rounded-full p-6" />
              </div>

              <Separator />

              {/* User Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <User className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">الاسم</p>
                    <p className="text-lg font-bold">{user?.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Mail className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      البريد الإلكتروني
                    </p>
                    <p className="text-lg font-bold">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Phone className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">الهاتف</p>
                    <p className="text-lg font-bold">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Phone className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      الهاتف البديل
                    </p>
                    <p className="text-lg font-bold">
                      {user.alternative_phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Phone className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">الموقع</p>
                    <p className="text-lg font-bold">{user.location}</p>
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
              <CardTitle className="text-right">معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  تاريخ الانضمام
                </span>
                <Badge variant="secondary" className="text-sm">
                  {formatDate(user.createdAt)}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الدور
                </span>
                <Badge variant="outline" className="gap-1 text-sm">
                  <Shield className="size-3" />
                  مسؤول
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full gap-2"
                variant="default"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="size-4" />
                تعديل الملف الشخصي
              </Button>
              <Button
                onClick={() => navigate("/settings/general")}
                className="w-full gap-2"
                variant="secondary"
              >
                <Settings className="size-4" />
                الإعدادات
              </Button>
              <Separator />
              <LogoutDialog />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
};

export default UserProfile;

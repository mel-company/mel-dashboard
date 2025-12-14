import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { User, Mail, Edit, Lock, Shield, Settings } from "lucide-react";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
                    <p className="text-lg font-bold">{user.name}</p>
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
              </div>
            </CardContent>
          </Card>

          {/* Account Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Settings className="size-5" />
                إعدادات الحساب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-between gap-2"
                  onClick={() => {}}
                >
                  <span className="text-right">تعديل المعلومات الشخصية</span>
                  <Edit className="size-4" />
                </Button>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full justify-between gap-2"
                  onClick={() => {}}
                >
                  <span className="text-right">تغيير كلمة المرور</span>
                  <Lock className="size-4" />
                </Button>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full justify-between gap-2"
                  onClick={() => navigate("/settings")}
                >
                  <span className="text-right">الإعدادات العامة</span>
                  <Settings className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">معلومات الحساب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-sm">
                  {user.name}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الاسم
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 max-w-xs">
                  <Mail className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm line-clamp-1">{user.email}</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  البريد
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="gap-1 text-sm">
                  <Shield className="size-3" />
                  مسؤول
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الدور
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
              <Button className="w-full gap-2" variant="default">
                <Edit className="size-4" />
                تعديل الملف الشخصي
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Lock className="size-4" />
                تغيير كلمة المرور
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Settings className="size-4" />
                الإعدادات
              </Button>
              <Separator />
              <Button
                className="w-full gap-2"
                variant="destructive"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                تسجيل الخروج
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

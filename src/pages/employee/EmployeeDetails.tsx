import { useParams, useNavigate } from "react-router-dom";
import { dmy_employees } from "@/data/dummy";
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
  ArrowRight,
  User,
  Phone,
  Mail,
  Briefcase,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";

const EmployeeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employee = dmy_employees.find((e) => e.id === Number(id));

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">الموظف غير موجود</h2>
        <p className="text-muted-foreground mb-4">
          الموظف الذي تبحث عنه غير موجود أو تم حذفه.
        </p>
        <Button onClick={() => navigate("/employees")} variant="outline">
          العودة إلى الموظفين
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/employees")}
          className="gap-2"
        >
          <ArrowRight className="size-4" />
          العودة إلى الموظفين
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="size-4" />
            تعديل
          </Button>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="size-4" />
            حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Employee Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Header Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-right">
                {employee.name}
              </CardTitle>
              <CardDescription className="text-right">
                موظف رقم #{employee.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-64 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                <User className="size-24 text-white bg-cyan/40 rounded-full p-6" />
              </div>

              <Separator />

              {/* Employee Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Briefcase className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">المنصب</p>
                    <p className="text-lg font-bold">{employee.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Phone className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="text-lg font-bold">{employee.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card sm:col-span-2">
                  <Mail className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                    <p className="text-lg font-bold">{employee.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <Badge variant="secondary" className="text-sm">
                    #{employee.id}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground text-right">
                    رقم الموظف
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <Badge variant="outline" className="gap-1">
                    <Briefcase className="size-3" />
                    {employee.role}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground text-right">
                    المنصب
                  </span>
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
                  #{employee.id}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم الموظف
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="gap-1 text-sm">
                  <Briefcase className="size-3" />
                  {employee.role}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  المنصب
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-sm">{employee.phone}</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الهاتف
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 max-w-xs">
                  <Mail className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm line-clamp-1">{employee.email}</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  البريد
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
                تعديل الموظف
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Calendar className="size-4" />
                عرض الجدول الزمني
              </Button>
              <Button className="w-full gap-2" variant="destructive">
                <Trash2 className="size-4" />
                حذف الموظف
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;

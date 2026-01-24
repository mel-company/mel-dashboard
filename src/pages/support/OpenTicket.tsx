import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, ArrowRight, Loader2 } from "lucide-react";
import { useCreateTicketStore } from "@/api/wrappers/ticket.wrappers";
import { toast } from "sonner";

const TICKET_TYPES = [
  { value: "BUG", label: "علة الخطأ" },
  { value: "FEATURE_REQUEST", label: "طلب ميزة" },
  { value: "QUESTION", label: "سؤال" },
  { value: "SUPPORT", label: "دعم" },
  { value: "FEEDBACK", label: "ملاحظات" },
  { value: "REPORT", label: "بلاغ" },
  { value: "OTHER", label: "أخرى" },
] as const;

const DEPARTMENTS = [
  { value: "CUSTOMER_SERVICE", label: "خدمة العملاء" },
  { value: "FINANCE", label: "مالية" },
  { value: "MARKETING", label: "تسويق" },
  { value: "SALES", label: "مبيعات" },
  { value: "IT", label: "تقنية المعلومات" },
] as const;

const OpenTicket = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("SUPPORT");
  const [department, setDepartment] = useState<string>("CUSTOMER_SERVICE");

  const { mutate: createTicket, isPending: isCreating } = useCreateTicketStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const t = title.trim();
    const d = description.trim();

    if (!t) {
      toast.error("يرجى إدخال عنوان التذكرة");
      return;
    }

    if (!d) {
      toast.error("يرجى إدخال وصف المشكلة أو الطلب");
      return;
    }

    createTicket(
      {
        title: t,
        description: d,
        type: type || undefined,
        department: department || undefined,
      },
      {
        onSuccess: (data) => {
          toast.success("تم فتح التذكرة بنجاح");
          navigate(`/tickets/${data.id}`);
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "فشل في فتح التذكرة. حاول مرة أخرى.";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-right">فتح تذكرة دعم</h1>
            <p className="text-sm text-muted-foreground text-right">
              صف مشكلتك أو طلبك وسنرد عليك في أقرب وقت
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="">
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <FileText className="size-5" />
              تفاصيل التذكرة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-right">
                العنوان <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: مشكلة في الدفع"
                className="text-right"
                dir="rtl"
                maxLength={200}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">
                الوصف <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اشرح تفاصيل المشكلة أو الطلب..."
                className="text-right min-h-[140px]"
                dir="rtl"
                disabled={isCreating}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-right">نوع التذكرة</Label>
                <Select
                  value={type}
                  onValueChange={setType}
                  disabled={isCreating}
                >
                  <SelectTrigger className="w-full text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-right">القسم</Label>
                <Select
                  value={department}
                  onValueChange={setDepartment}
                  disabled={isCreating}
                >
                  <SelectTrigger className="w-full text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button type="submit" disabled={isCreating} className="gap-2">
                {isCreating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                فتح التذكرة
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={isCreating}
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default OpenTicket;

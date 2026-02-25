import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";

export const TICKET_TYPES = [
  { value: "BUG", label: "خطأ" },
  { value: "FEATURE_REQUEST", label: "طلب ميزة" },
  { value: "QUESTION", label: "سؤال" },
  { value: "SUPPORT", label: "دعم" },
  { value: "FEEDBACK", label: "ملاحظة" },
  { value: "REPORT", label: "بلاغ" },
  { value: "OTHER", label: "أخرى" },
] as const;

export const TICKET_DEPARTMENTS = [
  { value: "CUSTOMER_SERVICE", label: "خدمة العملاء" },
  { value: "FINANCE", label: "مالية" },
  { value: "MARKETING", label: "تسويق" },
  { value: "SALES", label: "مبيعات" },
  { value: "IT", label: "تقنية المعلومات" },
  { value: "OTHER", label: "أخرى" },
] as const;

export const TICKET_STATUSES = [
  { value: "OPEN", label: "مفتوح" },
  { value: "CLOSED", label: "مغلق" },
  { value: "IN_PROGRESS", label: "قيد التنفيذ" },
  { value: "ON_HOLD", label: "معلق" },
  { value: "RESOLVED", label: "محلول" },
  { value: "CANCELLED", label: "ملغي" },
] as const;

export type TicketFilterValues = {
  type: string | undefined;
  status: string | undefined;
  department: string | undefined;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: TicketFilterValues;
  onApply: (values: TicketFilterValues) => void;
  onClear: () => void;
};

const TicketFilterDialog = ({
  open,
  onOpenChange,
  values,
  onApply,
  onClear,
}: Props) => {
  const [type, setType] = useState<string | undefined>(values.type);
  const [status, setStatus] = useState<string | undefined>(values.status);
  const [department, setDepartment] = useState<string | undefined>(
    values.department
  );

  useEffect(() => {
    if (open) {
      setType(values.type);
      setStatus(values.status);
      setDepartment(values.department);
    }
  }, [open, values.type, values.status, values.department]);

  const handleApply = () => {
    onApply({ type, status, department });
    onOpenChange(false);
  };

  const handleClear = () => {
    setType(undefined);
    setStatus(undefined);
    setDepartment(undefined);
    onClear();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Filter className="size-4" />
            تصفية التذاكر
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر المعايير لتصفية قائمة تذاكر الدعم
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type */}
          <div className="space-y-2">
            <Label className="text-right block">النوع</Label>
            <Select
              value={type ?? "all"}
              onValueChange={(v) => setType(v === "all" ? undefined : v)}
            >
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {TICKET_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-right block">الحالة</Label>
            <Select
              value={status ?? "all"}
              onValueChange={(v) => setStatus(v === "all" ? undefined : v)}
            >
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {TICKET_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label className="text-right block">القسم</Label>
            <Select
              value={department ?? "all"}
              onValueChange={(v) =>
                setDepartment(v === "all" ? undefined : v)
              }
            >
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {TICKET_DEPARTMENTS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={handleClear} className="gap-2">
            <X className="size-4" />
            مسح
          </Button>
          <Button onClick={handleApply} className="gap-2">
            <Filter className="size-4" />
            تطبيق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketFilterDialog;

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

export const ORDER_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export const ORDER_PERIOD = {
  today: "today",
  "7days": "7days",
  month: "month",
  year: "year",
} as const;

export type OrderFilterValues = {
  status: string | undefined;
  period: "today" | "7days" | "month" | "year" | undefined;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: OrderFilterValues;
  onApply: (values: OrderFilterValues) => void;
  onClear: () => void;
};

const OrderFilterDialog = ({
  open,
  onOpenChange,
  values,
  onApply,
  onClear,
}: Props) => {
  const [status, setStatus] = useState<string | undefined>(values.status);
  const [period, setPeriod] = useState<
    "today" | "7days" | "month" | "year" | undefined
  >(values.period);

  useEffect(() => {
    if (open) {
      setStatus(values.status);
      setPeriod(values.period);
    }
  }, [open, values.status, values.period]);

  const handleApply = () => {
    onApply({ status, period });
    onOpenChange(false);
  };

  const handleClear = () => {
    setStatus(undefined);
    setPeriod(undefined);
    onClear();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Filter className="size-4" />
            تصفية الطلبات
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر المعايير لتصفية قائمة الطلبات
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
                <SelectItem value={ORDER_STATUS.PENDING}>قيد الانتظار</SelectItem>
                <SelectItem value={ORDER_STATUS.PROCESSING}>
                  قيد المعالجة
                </SelectItem>
                <SelectItem value={ORDER_STATUS.SHIPPED}>تم الشحن</SelectItem>
                <SelectItem value={ORDER_STATUS.DELIVERED}>تم التسليم</SelectItem>
                <SelectItem value={ORDER_STATUS.CANCELLED}>ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label className="text-right block">الفترة</Label>
            <Select
              value={period ?? "all"}
              onValueChange={(v) =>
                setPeriod(v === "all" ? undefined : (v as typeof period))
              }
            >
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value={ORDER_PERIOD.today}>اليوم</SelectItem>
                <SelectItem value={ORDER_PERIOD["7days"]}>آخر 7 أيام</SelectItem>
                <SelectItem value={ORDER_PERIOD.month}>هذا الشهر</SelectItem>
                <SelectItem value={ORDER_PERIOD.year}>هذه السنة</SelectItem>
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

export default OrderFilterDialog;

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { DISCOUNT_STATUS } from "@/utils/constants";

export type DiscountFilterValues = {
  status: string | undefined;
  startDate: string;
  endDate: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: DiscountFilterValues;
  onApply: (values: DiscountFilterValues) => void;
  onClear: () => void;
};

const DiscountFilterDialog = ({
  open,
  onOpenChange,
  values,
  onApply,
  onClear,
}: Props) => {
  const [status, setStatus] = useState<string | undefined>(values.status);
  const [startDate, setStartDate] = useState(values.startDate);
  const [endDate, setEndDate] = useState(values.endDate);

  useEffect(() => {
    if (open) {
      setStatus(values.status);
      setStartDate(values.startDate);
      setEndDate(values.endDate);
    }
  }, [open, values.status, values.startDate, values.endDate]);

  const handleApply = () => {
    onApply({ status, startDate, endDate });
    onOpenChange(false);
  };

  const handleClear = () => {
    setStatus(undefined);
    setStartDate("");
    setEndDate("");
    onClear();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Filter className="size-4" />
            تصفية الخصومات
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر المعايير لتصفية قائمة الخصومات
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
                <SelectItem value={DISCOUNT_STATUS.ACTIVE}>نشط</SelectItem>
                <SelectItem value={DISCOUNT_STATUS.INACTIVE}>غير نشط</SelectItem>
                <SelectItem value={DISCOUNT_STATUS.EXPIRED}>منتهي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date period */}
          <div className="space-y-2">
            <Label className="text-right block">الفترة الزمنية</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">من</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-right"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">إلى</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-right"
                />
              </div>
            </div>
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

export default DiscountFilterDialog;

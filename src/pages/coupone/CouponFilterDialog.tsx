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

export type CouponFilterValues = {
  isActive: boolean | undefined;
  startDate: string;
  expireDate: string;
  maxUsageLimit: number | undefined;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: CouponFilterValues;
  onApply: (values: CouponFilterValues) => void;
  onClear: () => void;
};

const CouponFilterDialog = ({
  open,
  onOpenChange,
  values,
  onApply,
  onClear,
}: Props) => {
  const [isActive, setIsActive] = useState<boolean | undefined>(values.isActive);
  const [startDate, setStartDate] = useState(values.startDate);
  const [expireDate, setExpireDate] = useState(values.expireDate);
  const [maxUsageLimit, setMaxUsageLimit] = useState<string>(
    values.maxUsageLimit !== undefined && values.maxUsageLimit !== null
      ? String(values.maxUsageLimit)
      : ""
  );

  useEffect(() => {
    if (open) {
      setIsActive(values.isActive);
      setStartDate(values.startDate);
      setExpireDate(values.expireDate);
      setMaxUsageLimit(
        values.maxUsageLimit !== undefined && values.maxUsageLimit !== null
          ? String(values.maxUsageLimit)
          : ""
      );
    }
  }, [
    open,
    values.isActive,
    values.startDate,
    values.expireDate,
    values.maxUsageLimit,
  ]);

  const handleApply = () => {
    const limitNum =
      maxUsageLimit.trim() !== ""
        ? parseInt(maxUsageLimit, 10)
        : undefined;
    onApply({
      isActive,
      startDate,
      expireDate,
      maxUsageLimit:
        limitNum !== undefined && !isNaN(limitNum) ? limitNum : undefined,
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setIsActive(undefined);
    setStartDate("");
    setExpireDate("");
    setMaxUsageLimit("");
    onClear();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Filter className="size-4" />
            تصفية الكوبونات
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر المعايير لتصفية قائمة الكوبونات
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Is Active */}
          <div className="space-y-2">
            <Label className="text-right block">الحالة</Label>
            <Select
              value={isActive === undefined ? "all" : isActive ? "yes" : "no"}
              onValueChange={(v) =>
                setIsActive(v === "all" ? undefined : v === "yes")
              }
            >
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="yes">نشط</SelectItem>
                <SelectItem value="no">غير نشط</SelectItem>
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
                  value={expireDate}
                  onChange={(e) => setExpireDate(e.target.value)}
                  className="text-right"
                />
              </div>
            </div>
          </div>

          {/* Max usage limit */}
          <div className="space-y-2">
            <Label className="text-right block">الحد الأقصى للاستخدام</Label>
            <Input
              type="number"
              min={0}
              placeholder="بدون حد"
              value={maxUsageLimit}
              onChange={(e) => setMaxUsageLimit(e.target.value)}
              className="text-right"
            />
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

export default CouponFilterDialog;

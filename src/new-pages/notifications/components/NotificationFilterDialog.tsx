import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NotificationFilterValues } from "@/api/types/notification";

type NotificationFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: NotificationFilterValues;
  onApply: (filters: NotificationFilterValues) => void;
  onClear: () => void;
};

const NotificationFilterDialog = ({
  open,
  onOpenChange,
  filters,
  onApply,
  onClear,
}: NotificationFilterDialogProps) => {
  const [localFilters, setLocalFilters] =
    useState<NotificationFilterValues>(filters);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">فلتر الإشعارات</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-right block">النوع</label>
            <Select
              value={localFilters.type ?? "all"}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  type: value === "all" ? undefined : (value as NotificationFilterValues["type"]),
                }))
              }
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="جميع الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
                <SelectItem value="alert">تنبيهات</SelectItem>
                <SelectItem value="new">أضافة جديدة</SelectItem>
                <SelectItem value="order">طلب جديد</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-right block">الحالة</label>
            <Select
              value={localFilters.readStatus ?? "all"}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  readStatus:
                    value === "all"
                      ? undefined
                      : (value as NotificationFilterValues["readStatus"]),
                }))
              }
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="unread">غير مقروء</SelectItem>
                <SelectItem value="read">مقروء</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            variant="outline"
            onClick={() => {
              onClear();
              onOpenChange(false);
            }}
          >
            مسح الفلاتر
          </Button>
          <Button
            onClick={() => {
              onApply(localFilters);
              onOpenChange(false);
            }}
          >
            تطبيق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationFilterDialog;

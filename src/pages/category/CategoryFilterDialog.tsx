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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, ChevronDown, X } from "lucide-react";
import { useFetchGroups } from "@/api/wrappers/group.wrappers";

type GroupItem = { id: string; name: string };

export type CategoryFilterValues = {
  groupIds: string[];
  hasDiscount: boolean | undefined;
  enabled: boolean | undefined;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: CategoryFilterValues;
  onApply: (values: CategoryFilterValues) => void;
  onClear: () => void;
};

const CategoryFilterDialog = ({
  open,
  onOpenChange,
  values,
  onApply,
  onClear,
}: Props) => {
  const [groupIds, setGroupIds] = useState<string[]>(values.groupIds);
  const [hasDiscount, setHasDiscount] = useState<boolean | undefined>(
    values.hasDiscount,
  );
  const [enabled, setEnabled] = useState<boolean | undefined>(values.enabled);

  const { data: groupsData } = useFetchGroups(undefined, open);
  const groups: GroupItem[] = Array.isArray(groupsData?.data)
    ? groupsData.data
    : Array.isArray(groupsData)
      ? groupsData
      : [];

  useEffect(() => {
    if (open) {
      setGroupIds(values.groupIds);
      setHasDiscount(values.hasDiscount);
      setEnabled(values.enabled);
    }
  }, [open, values.groupIds, values.hasDiscount, values.enabled]);

  const handleApply = () => {
    onApply({ groupIds, hasDiscount, enabled });
    onOpenChange(false);
  };

  const handleClear = () => {
    setGroupIds([]);
    setHasDiscount(undefined);
    setEnabled(undefined);
    onClear();
    onOpenChange(false);
  };

  const toggleGroup = (groupId: string) => {
    setGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Filter className="size-4" />
            تصفية الفئات
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر المعايير لتصفية قائمة الفئات
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Groups multi-select */}
          <div className="space-y-2">
            <Label className="text-right block">المجموعات</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-right font-normal"
                >
                  <span className="truncate text-foreground">
                    {groupIds.length === 0
                      ? "جميع المجموعات"
                      : groupIds.length === 1
                        ? (groups.find((g) => g.id === groupIds[0])?.name ??
                          "مجموعة واحدة")
                        : `${groupIds.length} مجموعات`}
                  </span>
                  <ChevronDown className="size-4 opacity-50 mr-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-(--radix-dropdown-menu-trigger-width) max-h-60 overflow-y-auto"
              >
                {groups.length === 0 ? (
                  <div className="py-4 px-2 text-center text-sm text-muted-foreground">
                    لا توجد مجموعات
                  </div>
                ) : (
                  groups.map((group) => (
                    <DropdownMenuCheckboxItem
                      key={group.id}
                      checked={groupIds.includes(group.id)}
                      onCheckedChange={() => toggleGroup(group.id)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="text-right">{group.name}</span>
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Has Discount */}
          <div className="space-y-2">
            <Label className="text-right block">يحتوي على خصم</Label>
            <Select
              value={
                hasDiscount === undefined ? "all" : hasDiscount ? "yes" : "no"
              }
              onValueChange={(v) =>
                setHasDiscount(v === "all" ? undefined : v === "yes")
              }
            >
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="yes">نعم</SelectItem>
                <SelectItem value="no">لا</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enabled */}
          <div className="space-y-2">
            <Label className="text-right block">الحالة</Label>
            <Select
              value={enabled === undefined ? "all" : enabled ? "yes" : "no"}
              onValueChange={(v) =>
                setEnabled(v === "all" ? undefined : v === "yes")
              }
            >
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="yes">مفعّل</SelectItem>
                <SelectItem value="no">معطّل</SelectItem>
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

export default CategoryFilterDialog;

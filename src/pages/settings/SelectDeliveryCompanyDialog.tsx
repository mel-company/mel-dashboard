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
import { Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { useFetchDeliveryCompanies } from "@/api/wrappers/delivery-company.wrappers";
import { useUpdateDeliveryCompany } from "@/api/wrappers/settings.wrappers";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDeliveryCompanyId?: string;
  onSuccess?: () => void;
};

const SelectDeliveryCompanyDialog = ({
  open,
  onOpenChange,
  currentDeliveryCompanyId,
  onSuccess,
}: Props) => {
  const [selectedDeliveryCompanyId, setSelectedDeliveryCompanyId] = useState<
    string | undefined
  >(currentDeliveryCompanyId);

  // Update selected value when currentDeliveryCompanyId changes
  useEffect(() => {
    setSelectedDeliveryCompanyId(currentDeliveryCompanyId);
  }, [currentDeliveryCompanyId, open]);

  const { data: deliveryCompanies, isLoading: isLoadingDeliveryCompanies } =
    useFetchDeliveryCompanies(open);

  const { mutate: updateDeliveryCompany, isPending } =
    useUpdateDeliveryCompany();

  const handleSubmit = () => {
    if (!selectedDeliveryCompanyId) {
      toast.error("يرجى اختيار شركة التوصيل");
      return;
    }

    // Check if the selected delivery company is the same as the current one
    if (selectedDeliveryCompanyId === currentDeliveryCompanyId) {
      // No change, just close the dialog
      onOpenChange(false);
      return;
    }

    updateDeliveryCompany(selectedDeliveryCompanyId, {
      onSuccess: () => {
        toast.success("تم تحديث شركة التوصيل بنجاح");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "فشل في تحديث شركة التوصيل. حاول مرة أخرى."
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right sm:max-w-md">
        <DialogHeader className="text-right">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="size-6 text-primary" />
            <DialogTitle>اختر شركة التوصيل</DialogTitle>
          </div>
          <DialogDescription className="text-right">
            اختر شركة التوصيل التي تريد استخدامها للمتجر
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryCompany">
              شركة التوصيل <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedDeliveryCompanyId || ""}
              onValueChange={setSelectedDeliveryCompanyId}
              disabled={isLoadingDeliveryCompanies || isPending}
            >
              <SelectTrigger id="deliveryCompany" className="w-full text-right">
                <div className="flex items-center gap-2 flex-1">
                  <SelectValue placeholder="اختر شركة التوصيل" />
                  {isLoadingDeliveryCompanies && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {isLoadingDeliveryCompanies ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                ) : deliveryCompanies && deliveryCompanies.length > 0 ? (
                  deliveryCompanies.map((company: any) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name || "بدون اسم"}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    لا توجد شركات توصيل متاحة
                  </div>
                )}
              </SelectContent>
            </Select>
            {!selectedDeliveryCompanyId && (
              <p className="text-xs text-destructive">
                يرجى اختيار شركة التوصيل
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDeliveryCompanyId || isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Truck className="size-4" />
                حفظ
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectDeliveryCompanyDialog;

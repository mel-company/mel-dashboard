import { useState, useEffect, useMemo } from "react";
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

type DeliveryCompany = {
  id: string;
  name?: string;
  description?: string;
  code?: string;
};

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

  useEffect(() => {
    setSelectedDeliveryCompanyId(currentDeliveryCompanyId);
  }, [currentDeliveryCompanyId, open]);

  const { data: deliveryCompanies, isLoading: isLoadingDeliveryCompanies } =
    useFetchDeliveryCompanies(open);

  const { mutate: updateDeliveryCompany, isPending } =
    useUpdateDeliveryCompany();

  const companies = (deliveryCompanies ?? []) as DeliveryCompany[];

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedDeliveryCompanyId),
    [companies, selectedDeliveryCompanyId],
  );

  const handleSubmit = () => {
    if (!selectedDeliveryCompanyId) {
      toast.error("يرجى اختيار شركة التوصيل");
      return;
    }

    if (selectedDeliveryCompanyId === currentDeliveryCompanyId) {
      onOpenChange(false);
      return;
    }

    updateDeliveryCompany(selectedDeliveryCompanyId, {
      onSuccess: () => {
        toast.success("تم تحديث شركة التوصيل بنجاح");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error: { response?: { data?: { message?: string } } }) => {
        toast.error(
          error?.response?.data?.message ||
            "فشل في تحديث شركة التوصيل. حاول مرة أخرى.",
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right sm:max-w-md">
        <DialogHeader className="text-right">
          <div className="mb-2 flex items-center gap-3">
            <Truck className="size-6 text-primary" />
            <DialogTitle>اختر شركة التوصيل</DialogTitle>
          </div>
          <DialogDescription className="text-right text-xs">
            اختر شركة الشحن التي تريد ربطها بمتجرك
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
              <SelectTrigger id="deliveryCompany" className="h-auto w-full py-2.5 text-right">
                <div className="flex flex-1 items-center gap-2">
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
                ) : companies.length > 0 ? (
                  companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex flex-col gap-0.5 py-0.5 text-right">
                        <span className="text-sm font-medium">
                          {company.name || "بدون اسم"}
                        </span>
                        {company.description && (
                          <span className="text-[11px] leading-snug text-muted-foreground">
                            {company.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    لا توجد شركات توصيل متاحة
                  </div>
                )}
              </SelectContent>
            </Select>

            {selectedCompany?.description && (
              <p className="text-[11px] leading-snug text-slate-500">
                {selectedCompany.description}
              </p>
            )}

            {selectedCompany?.code === "prime" && (
              <p className="rounded-xl bg-sky-50 px-3 py-2 text-[11px] leading-snug text-sky-700">
                Prime (برايم) — بعد الحفظ يمكنك إكمال ربط التاجر عبر إعدادات
                Prime.
              </p>
            )}

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

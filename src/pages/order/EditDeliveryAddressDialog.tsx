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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { useFetchStates } from "@/api/wrappers/state.wrappers";
import { useFetchRegionsByState } from "@/api/wrappers/region.wrappers";
import { useUpdateDeliveryAddress } from "@/api/wrappers/order.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  initialData?: {
    stateId?: string;
    regionId?: string;
    nearest_point?: string;
  };
};

const EditDeliveryAddressDialog = ({
  open,
  onOpenChange,
  initialData,
  orderId,
}: Props) => {
  const [selectedStateId, setSelectedStateId] = useState<string>(
    initialData?.stateId || ""
  );
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    initialData?.regionId || ""
  );
  const [nearestPoint, setNearestPoint] = useState<string>(
    initialData?.nearest_point || ""
  );

  // Fetch states (country is set to Iraq by default in backend)
  const { data: states, isLoading: isLoadingStates } = useFetchStates(
    undefined,
    open
  );

  // Fetch regions when state is selected
  const { data: regions, isLoading: isLoadingRegions } = useFetchRegionsByState(
    selectedStateId,
    open && !!selectedStateId
  );

  const {
    mutate: updateDeliveryAddress,
    isPending: isUpdatingDeliveryAddress,
  } = useUpdateDeliveryAddress(orderId ?? "");

  // Reset region when state changes
  useEffect(() => {
    if (selectedStateId !== initialData?.stateId) {
      setSelectedRegionId("");
    }
  }, [selectedStateId, initialData?.stateId]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedStateId(initialData?.stateId || "");
      setSelectedRegionId(initialData?.regionId || "");
      setNearestPoint(initialData?.nearest_point || "");
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      stateId: selectedStateId,
      regionId: selectedRegionId || undefined,
      nearest_point: nearestPoint || undefined,
    };

    updateDeliveryAddress(formData, {
      onSuccess: () => {
        toast.success("تم تحديث عنوان التوصيل بنجاح");
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل تحديث عنوان التوصيل"
        );
      },
    });
  };

  // Helper function to get display name from JSON name field
  const getDisplayName = (name: any): string => {
    if (!name) return "—";
    if (typeof name === "string") return name;
    if (typeof name === "object") {
      return name.ar || name.arabic || name.en || name.english || "—";
    }
    return "—";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right max-w-2xl">
        <DialogHeader className="text-right">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="size-6 text-primary" />
            <DialogTitle className="text-right">
              تعديل عنوان التوصيل
            </DialogTitle>
          </div>
          <DialogDescription className="text-right">
            اختر المحافظة والمنطقة وأدخل أقرب نقطة دالة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* State Selection */}
          <div className="space-y-2">
            <Label htmlFor="state" className="text-right">
              المحافظة <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedStateId}
              onValueChange={setSelectedStateId}
              disabled={isLoadingStates}
            >
              <SelectTrigger id="state" className="w-full text-right">
                <div className="flex items-center gap-2 flex-1">
                  <SelectValue placeholder="اختر المحافظة">
                    {selectedStateId &&
                      getDisplayName(
                        states?.find((s: any) => s.id === selectedStateId)?.name
                      )}
                  </SelectValue>
                  {isLoadingStates && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {isLoadingStates ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                ) : states && states.length > 0 ? (
                  states.map((state: any) => (
                    <SelectItem key={state.id} value={state.id}>
                      {getDisplayName(state.name)}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    لا توجد ولايات متاحة
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Region Selection */}
          <div className="space-y-2">
            <Label htmlFor="region" className="text-right">
              المنطقة
            </Label>
            <Select
              value={selectedRegionId}
              onValueChange={setSelectedRegionId}
              disabled={!selectedStateId || isLoadingRegions}
            >
              <SelectTrigger id="region" className="w-full text-right">
                <div className="flex items-center gap-2 flex-1">
                  <SelectValue placeholder="اختر المنطقة (اختياري)" />
                  {isLoadingRegions && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {!selectedStateId ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    يرجى اختيار المحافظة أولاً
                  </div>
                ) : isLoadingRegions ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                ) : regions && regions.length > 0 ? (
                  regions.map((region: any) => (
                    <SelectItem key={region.id} value={region.id}>
                      {getDisplayName(region.name)}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    لا توجد مناطق متاحة
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Nearest Point Input */}
          <div className="space-y-2">
            <Label htmlFor="nearest_point" className="text-right">
              أقرب نقطة دالة
            </Label>
            <Input
              id="nearest_point"
              type="text"
              value={nearestPoint}
              onChange={(e) => setNearestPoint(e.target.value)}
              placeholder="أدخل أقرب نقطة دالة (مثل: قرب المدرسة، شارع الرئيسي، إلخ)"
              className="text-right"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isUpdatingDeliveryAddress}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={!selectedStateId || isUpdatingDeliveryAddress}
            >
              {isUpdatingDeliveryAddress ? (
                <>
                  <Loader2 className="ml-2 size-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDeliveryAddressDialog;

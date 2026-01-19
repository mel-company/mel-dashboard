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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Ticket, CheckCircle2, XCircle, Save } from "lucide-react";
import {
  useUpdateCoupon,
  useFetchCoupon,
  useCheckCodeAvailability,
} from "@/api/wrappers/coupon.wrappers";
import { toast } from "sonner";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couponId: string;
};

const EditCouponDialog = ({ open, onOpenChange, couponId }: Props) => {
  const { data: coupon, isLoading: isLoadingCoupon } = useFetchCoupon(
    couponId,
    open && !!couponId
  );

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [minOrderTotal, setMinOrderTotal] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupon();

  // Debounce code for availability check
  const debouncedCode = useDebouncedValue(code.trim(), 500);
  const shouldCheckCode =
    debouncedCode.length >= 2 &&
    debouncedCode.length <= 50 &&
    debouncedCode !== coupon?.code;

  const {
    data: codeAvailability,
    isLoading: isCheckingCode,
  } = useCheckCodeAvailability(
    shouldCheckCode
      ? { code: debouncedCode, excludeCouponId: couponId }
      : undefined,
    shouldCheckCode
  );

  // Initialize form data when coupon data is available
  useEffect(() => {
    if (coupon && open) {
      setCode(coupon.code || "");
      setDescription(coupon.description || "");
      setValue(coupon.value?.toString() || "");
      setMinOrderTotal(coupon.minOrderTotal?.toString() || "");
      setUsageLimit(coupon.usageLimit?.toString() || "");
      setIsActive(coupon.isActive ?? true);

      // Format dates for datetime-local input
      if (coupon.startsAt) {
        const startDate = new Date(coupon.startsAt);
        const localStartDate = new Date(
          startDate.getTime() - startDate.getTimezoneOffset() * 60000
        );
        setStartsAt(localStartDate.toISOString().slice(0, 16));
      } else {
        setStartsAt("");
      }

      if (coupon.expiresAt) {
        const endDate = new Date(coupon.expiresAt);
        const localEndDate = new Date(
          endDate.getTime() - endDate.getTimezoneOffset() * 60000
        );
        setExpiresAt(localEndDate.toISOString().slice(0, 16));
      } else {
        setExpiresAt("");
      }
    }
  }, [coupon, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!code.trim()) {
      toast.error("يرجى إدخال رمز الكوبون");
      return;
    }

    if (code.trim().length < 2 || code.trim().length > 50) {
      toast.error("رمز الكوبون يجب أن يكون بين 2 و 50 حرف");
      return;
    }

    // Check if code is available (if we have the check result and code changed)
    if (
      shouldCheckCode &&
      codeAvailability &&
      !codeAvailability.available
    ) {
      toast.error("رمز الكوبون مستخدم بالفعل. يرجى اختيار رمز آخر");
      return;
    }

    if (!value.trim() || isNaN(Number(value)) || Number(value) <= 0) {
      toast.error("يرجى إدخال قيمة صحيحة للخصم");
      return;
    }

    // Prepare data
    const couponData: any = {
      code: code.trim(),
      description: description.trim() || undefined,
      value: Number(value),
      isActive,
    };

    // Add optional fields if provided
    if (
      minOrderTotal.trim() &&
      !isNaN(Number(minOrderTotal)) &&
      Number(minOrderTotal) >= 0
    ) {
      couponData.minOrderTotal = Number(minOrderTotal);
    }

    if (
      usageLimit.trim() &&
      !isNaN(Number(usageLimit)) &&
      Number(usageLimit) > 0
    ) {
      couponData.usageLimit = Number(usageLimit);
    }

    if (startsAt.trim()) {
      couponData.startsAt = new Date(startsAt).toISOString();
    } else {
      couponData.startsAt = null;
    }

    if (expiresAt.trim()) {
      couponData.expiresAt = new Date(expiresAt).toISOString();
    } else {
      couponData.expiresAt = null;
    }

    updateCoupon(
      { id: couponId, data: couponData },
      {
        onSuccess: () => {
          toast.success("تم تحديث الكوبون بنجاح");
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في تحديث الكوبون. حاول مرة أخرى."
          );
        },
      }
    );
  };

  if (isLoadingCoupon) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="text-right max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-right sm:max-w-4xl max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right flex items-center gap-2">
            <Ticket className="size-5" />
            تعديل الكوبون
          </DialogTitle>
          <DialogDescription className="text-right">
            قم بتحديث معلومات الكوبون. يمكنك حفظ التغييرات أو إلغاؤها.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Ticket className="size-5" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Code */}
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-right">
                    رمز الكوبون <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="مثال: RAMADAN20"
                      className={`text-right pr-10 ${
                        codeAvailability && !codeAvailability.available
                          ? "border-destructive focus-visible:ring-destructive"
                          : codeAvailability && codeAvailability.available
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                      dir="rtl"
                      required
                      maxLength={50}
                    />
                    {shouldCheckCode && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {isCheckingCode ? (
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        ) : codeAvailability ? (
                          codeAvailability.available ? (
                            <CheckCircle2 className="size-4 text-green-500" />
                          ) : (
                            <XCircle className="size-4 text-destructive" />
                          )
                        ) : null}
                      </div>
                    )}
                  </div>
                  {shouldCheckCode && codeAvailability && (
                    <p
                      className={`text-xs text-right ${
                        codeAvailability.available
                          ? "text-green-600 dark:text-green-400"
                          : "text-destructive"
                      }`}
                    >
                      {codeAvailability.message}
                    </p>
                  )}
                  {!shouldCheckCode && code.trim().length > 0 && code.trim().length < 2 && (
                    <p className="text-xs text-muted-foreground text-right">
                      يجب أن يكون الرمز فريداً لكل متجر (2-50 حرف)
                    </p>
                  )}
                  {!shouldCheckCode && code.trim().length === 0 && (
                    <p className="text-xs text-muted-foreground text-right">
                      يجب أن يكون الرمز فريداً لكل متجر (2-50 حرف)
                    </p>
                  )}
                  {!shouldCheckCode && code === coupon?.code && (
                    <p className="text-xs text-muted-foreground text-right">
                      رمز الكوبون الحالي
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-right">
                    الوصف
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف الكوبون..."
                    className="text-right min-h-[100px]"
                    dir="rtl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Discount Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">تفاصيل الخصم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Value */}
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-right">
                    نسبة الخصم <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="مثال: 20"
                    className="text-right"
                    dir="rtl"
                    required
                  />
                </div>

                {/* Min Order Total */}
                <div className="space-y-2">
                  <Label htmlFor="minOrderTotal" className="text-right">
                    الحد الأدنى لقيمة الطلب (اختياري)
                  </Label>
                  <Input
                    id="minOrderTotal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={minOrderTotal}
                    onChange={(e) => setMinOrderTotal(e.target.value)}
                    placeholder="مثال: 100000"
                    className="text-right"
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    الحد الأدنى لقيمة الطلب المطلوبة لاستخدام هذا الكوبون
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Usage Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">حدود الاستخدام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Usage Limit */}
                <div className="space-y-2">
                  <Label htmlFor="usageLimit" className="text-right">
                    الحد الأقصى لعدد الاستخدامات
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="100"
                    className="text-right"
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    إجمالي عدد المرات التي يمكن استخدام هذا الكوبون فيها
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">التواريخ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startsAt" className="text-right">
                    تاريخ البدء (اختياري)
                  </Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="text-right"
                    dir="rtl"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="expiresAt" className="text-right">
                    تاريخ الانتهاء (اختياري)
                  </Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">الحالة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive" className="text-right">
                    تفعيل الكوبون
                  </Label>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  الكوبونات المفعلة فقط يمكن استخدامها
                </p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={
                isUpdating ||
                (shouldCheckCode && isCheckingCode) ||
                (codeAvailability && !codeAvailability.available)
              }
            >
              {isUpdating ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCouponDialog;

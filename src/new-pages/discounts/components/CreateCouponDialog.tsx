import { useState } from "react";
import { X, Loader2, Percent, Banknote } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Coupon02Icon } from "@hugeicons-pro/core-stroke-standard";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCreateCoupon } from "@/api/wrappers/coupon.wrappers";
import {
  SettingsField,
  SettingsInput,
  SettingsTextarea,
} from "@/new-pages/settings/components/SettingsField";

type CouponType = "PERCENTAGE" | "FIXED";

type CreateCouponDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (id: string) => void;
};

const COUPON_TYPES: { value: CouponType; label: string; icon: typeof Percent }[] = [
  { value: "PERCENTAGE", label: "نسبة مئوية", icon: Percent },
  { value: "FIXED", label: "مبلغ ثابت", icon: Banknote },
];

const CreateCouponDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateCouponDialogProps) => {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [couponType, setCouponType] = useState<CouponType>("PERCENTAGE");
  const [value, setValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { mutate: createCoupon, isPending } = useCreateCoupon();
  const isPercentage = couponType === "PERCENTAGE";

  const reset = () => {
    setCode("");
    setDescription("");
    setCouponType("PERCENTAGE");
    setValue("");
    setMaxDiscount("");
    setStartsAt("");
    setExpiresAt("");
    setIsActive(true);
  };

  const handleTypeChange = (type: CouponType) => {
    setCouponType(type);
    setValue("");
    setMaxDiscount("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = code.trim();
    const numValue = Number.parseFloat(value);

    if (!trimmedCode || trimmedCode.length < 2) {
      toast.error("يرجى إدخال عنوان كوبون صالح");
      return;
    }

    if (!Number.isFinite(numValue) || numValue <= 0) {
      toast.error(
        isPercentage
          ? "يرجى إدخال نسبة خصم صحيحة (1–100)"
          : "يرجى إدخال مبلغ خصم صحيح",
      );
      return;
    }

    if (isPercentage && numValue > 100) {
      toast.error("نسبة الخصم يجب أن تكون بين 1 و 100");
      return;
    }

    if (!startsAt || !expiresAt) {
      toast.error("يرجى تحديد تاريخ البدء والنفاذ");
      return;
    }

    const payload: Record<string, unknown> = {
      code: trimmedCode,
      description: description.trim() || undefined,
      type: couponType,
      value: numValue,
      appliesTo: "ALL",
      isActive,
      startsAt,
      expiresAt,
    };

    if (isPercentage && maxDiscount.trim()) {
      const max = Number.parseFloat(maxDiscount);
      if (Number.isFinite(max) && max > 0) payload.maxDiscount = max;
    }

    createCoupon(payload as never, {
      onSuccess: (data) => {
        toast.success("تم إنشاء الكوبون بنجاح");
        reset();
        onOpenChange(false);
        onSuccess?.(data.id);
      },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message;
        const msg = Array.isArray(message) ? message.join("، ") : message || "فشل في إنشاء الكوبون";
        toast.error(msg);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-lg rounded-3xl p-0" dir="rtl">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
              aria-label="إغلاق"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-blue-950">إضافة كوبون جديد</h2>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-100">
                <HugeiconsIcon icon={Coupon02Icon} size={24} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SettingsField label="عنوان الكوبون" htmlFor="couponCode">
              <SettingsInput
                id="couponCode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="LIMITED25"
                dir="ltr"
                disabled={isPending}
              />
            </SettingsField>

            <SettingsField label="وصف الكوبون" htmlFor="couponDesc">
              <SettingsTextarea
                id="couponDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اشرح تفاصيل الكوبون للعملاء..."
                rows={3}
                disabled={isPending}
              />
            </SettingsField>

            <SettingsField label="نوع الكوبون">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1.5">
                {COUPON_TYPES.map(({ value: type, label, icon: Icon }) => {
                  const selected = couponType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleTypeChange(type)}
                      className={cn(
                        "flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50",
                        selected
                          ? "bg-white text-sky-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      <Icon className="size-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </SettingsField>

            <div className={cn("grid gap-3", isPercentage ? "grid-cols-2" : "grid-cols-1")}>
              <SettingsField
                label={isPercentage ? "نسبة الخصم" : "مبلغ الخصم"}
                htmlFor="couponValue"
              >
                <div className="relative">
                  <SettingsInput
                    id="couponValue"
                    type="number"
                    min={1}
                    max={isPercentage ? 100 : undefined}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={isPercentage ? "25" : "10000"}
                    disabled={isPending}
                    className="pe-12"
                  />
                  <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-slate-400">
                    {isPercentage ? "%" : "د.ع"}
                  </span>
                </div>
              </SettingsField>

              {isPercentage && (
                <SettingsField label="الحد الأقصى لقيمة الخصم" htmlFor="couponMax">
                  <SettingsInput
                    id="couponMax"
                    type="number"
                    min={0}
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="50000"
                    disabled={isPending}
                  />
                </SettingsField>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SettingsField label="تاريخ البدء" htmlFor="couponStart">
                <SettingsInput
                  id="couponStart"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  disabled={isPending}
                />
              </SettingsField>
              <SettingsField label="تاريخ النفاذ" htmlFor="couponEnd">
                <SettingsInput
                  id="couponEnd"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  disabled={isPending}
                />
              </SettingsField>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">حالة الكوبون</span>
              <Switch
                checked={isActive}
                activeLabel="نشط"
                disabledLabel="معطل"
                onToggle={setIsActive}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-12 flex-1 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#00b7ff] text-sm font-semibold text-white hover:bg-[#00a3e6] disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                "إضافة"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCouponDialog;

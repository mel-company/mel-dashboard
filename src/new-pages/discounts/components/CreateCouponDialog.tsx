import { useState } from "react";
import { Calendar, Loader2, Percent } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCreateCoupon } from "@/api/wrappers/coupon.wrappers";
import {
  SettingsField,
  SettingsInput,
  SettingsTextarea,
  settingsInputClassName,
} from "@/new-pages/settings/components/SettingsField";

type CreateCouponDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (id: string) => void;
};

const darkFieldClass =
  "dark:border-0 dark:bg-[#0a0e27]/80 dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596] dark:focus-visible:ring-[#00b7ff]/30";

function getErrorMessage(err: unknown, fallback: string): string {
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;

  if (Array.isArray(message)) return message.join("، ");
  if (typeof message === "string") return message;
  return fallback;
}

const CreateCouponDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateCouponDialogProps) => {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [minOrderTotal, setMinOrderTotal] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { mutate: createCoupon, isPending } = useCreateCoupon();

  const reset = () => {
    setCode("");
    setDescription("");
    setValue("");
    setMinOrderTotal("");
    setStartsAt("");
    setExpiresAt("");
    setIsActive(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = code.trim();
    const numValue = Number.parseFloat(value);

    if (!trimmedCode || trimmedCode.length < 2) {
      toast.error("يرجى إدخال رمز كوبون صالح");
      return;
    }

    if (!Number.isFinite(numValue) || numValue <= 0) {
      toast.error("يرجى إدخال نسبة خصم صحيحة (1–100)");
      return;
    }

    if (numValue > 100) {
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
      type: "PERCENTAGE",
      value: numValue,
      appliesTo: "ALL",
      isActive,
      startsAt: new Date(startsAt).toISOString(),
      expiresAt: new Date(`${expiresAt}T23:59:59`).toISOString(),
    };

    if (minOrderTotal.trim()) {
      const min = Number.parseFloat(minOrderTotal);
      if (Number.isFinite(min) && min > 0) payload.minOrderTotal = min;
    }

    createCoupon(payload as never, {
      onSuccess: (data) => {
        toast.success("تم إنشاء الكوبون بنجاح");
        reset();
        onOpenChange(false);
        onSuccess?.(data.id);
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, "فشل في إنشاء الكوبون"));
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
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-h-[92dvh] max-w-lg gap-0 overflow-y-auto rounded-[2rem] border-0 p-0 shadow-xl sm:max-w-[792px] dark:bg-[#12183b]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col p-6 sm:p-6">
          <div className="mb-6 flex items-start justify-end gap-3 border-b border-slate-100 pb-5 dark:border-[#1f2448]">
            <div className="min-w-0 text-right">
              <DialogTitle className="text-xl font-normal text-slate-900 dark:text-[#e4e7fc]">
                اضافة كوبون جديد
              </DialogTitle>
              <p className="mt-0.5 text-sm text-slate-400 dark:text-[#a4b1fa]">
                يرجى ادخال جميع الحقول لاتمام عملية الاضافة
              </p>
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-[#9a5cff]/15 dark:text-[#b282ff]">
              <Percent className="size-5" strokeWidth={2.5} />
            </div>
          </div>

          <div className="space-y-6 [&_label]:dark:text-[#a4b1fa]">
            <SettingsField label="رمز الكوبون" htmlFor="couponCode">
              <SettingsInput
                id="couponCode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="اكتب رمز الكوبون"
                dir="ltr"
                disabled={isPending}
                className={cn("h-12 rounded-[14px]", darkFieldClass)}
              />
            </SettingsField>

            <SettingsField label="وصف الكوبون" htmlFor="couponDesc">
              <SettingsTextarea
                id="couponDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصف يوضح محتويات الكوبون"
                rows={4}
                disabled={isPending}
                className={cn(
                  "min-h-[136px] rounded-[14px] border-0 focus-visible:ring-0",
                  darkFieldClass,
                )}
              />
            </SettingsField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <SettingsField label="نسبة الخصم" htmlFor="couponValue">
                <div className="relative">
                  <SettingsInput
                    id="couponValue"
                    type="number"
                    min={1}
                    max={100}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="نسبة الخصم"
                    disabled={isPending}
                    className={cn("h-12 rounded-[14px] pl-12", darkFieldClass)}
                  />
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 dark:text-[#8e99f3]">
                    %
                  </span>
                </div>
              </SettingsField>

              <SettingsField label="الحد الأدنى للطلب" htmlFor="couponMinOrder">
                <div className="relative">
                  <SettingsInput
                    id="couponMinOrder"
                    type="number"
                    min={0}
                    value={minOrderTotal}
                    onChange={(e) => setMinOrderTotal(e.target.value)}
                    placeholder="الحد الأدنى للطلب"
                    disabled={isPending}
                    className={cn("h-12 rounded-[14px] pl-14", darkFieldClass)}
                  />
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 dark:text-[#8e99f3]">
                    د.ع
                  </span>
                </div>
              </SettingsField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <SettingsField label="تاريخ البدء والنفاذ">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400 dark:text-[#e4e7fc]/30" />
                    <input
                      id="couponStart"
                      type="date"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      disabled={isPending}
                      aria-label="تاريخ البدء"
                      className={cn(
                        settingsInputClassName,
                        "h-12 w-full rounded-[14px] pl-10 text-right",
                        darkFieldClass,
                      )}
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400 dark:text-[#e4e7fc]/30" />
                    <input
                      id="couponEnd"
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      disabled={isPending}
                      aria-label="تاريخ النفاذ"
                      className={cn(
                        settingsInputClassName,
                        "h-12 w-full rounded-[14px] pl-10 text-right",
                        darkFieldClass,
                      )}
                    />
                  </div>
                </div>
              </SettingsField>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-slate-500 dark:text-[#a4b1fa]">
                  حالة الكوبون
                </span>
                <div className="flex h-12 items-center">
                  <Switch
                    checked={isActive}
                    onToggle={setIsActive}
                    disabled={isPending}
                    activeLabel="مُفعل"
                    disabledLabel="معطل"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={isPending}
              className="flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-[#b282ff] to-[#33c5ff] text-lg font-bold text-white disabled:opacity-50 sm:w-[233px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "أضافة الكوبون"
              )}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex h-[60px] w-full items-center justify-center rounded-2xl text-lg font-bold text-slate-400 hover:text-slate-600 disabled:opacity-50 sm:w-[166px] dark:bg-transparent dark:text-[#4a5596] dark:hover:text-[#e4e7fc]"
            >
              الغاء
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCouponDialog;

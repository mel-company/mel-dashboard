import { useRef, useState } from "react";
import { X, Loader2, Upload } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PercentIcon } from "@hugeicons-pro/core-stroke-standard";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useCreateDiscount } from "@/api/wrappers/discount.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { useFetchCurrentSettings } from "@/api/wrappers/settings.wrappers";
import { DISCOUNT_STATUS } from "@/utils/constants";
import {
  SettingsField,
  SettingsInput,
  SettingsTextarea,
} from "@/new-pages/settings/components/SettingsField";

type CreateDiscountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (id: string) => void;
};

function resolveStoreId(
  storeDetails?: { id?: string; storeId?: string } | null,
  currentSettings?: { storeId?: string; store_id?: string } | null,
): string | undefined {
  return (
    storeDetails?.id ??
    storeDetails?.storeId ??
    currentSettings?.storeId ??
    currentSettings?.store_id
  );
}

function resolveTempImageUrl(
  storeDetails?: { logo?: string | null; baseUrl?: string | null } | null,
): string | undefined {
  const logo = storeDetails?.logo;
  if (!logo) return undefined;
  if (logo.startsWith("http://") || logo.startsWith("https://")) return logo;
  if (storeDetails?.baseUrl) return `${storeDetails.baseUrl}/${logo}`;
  return undefined;
}

function getErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;

  if (Array.isArray(message)) return message.join("، ");
  if (typeof message === "string") return message;
  return fallback;
}

const CreateDiscountDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateDiscountDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [percentage, setPercentage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: storeDetails } = useFetchStoreDetails();
  const { data: currentSettings } = useFetchCurrentSettings(open);
  const { mutate: createDiscount, isPending } = useCreateDiscount();

  const reset = () => {
    setName("");
    setDescription("");
    setPercentage("");
    setStartDate("");
    setEndDate("");
    setIsActive(true);
    setImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("الرجاء اختيار ملف صورة");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 2MB");
      return;
    }

    setImageFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const pct = Number.parseFloat(percentage);
    const storeId = resolveStoreId(storeDetails, currentSettings);

    if (!storeId) {
      toast.error("تعذر تحديد المتجر. حاول تحديث الصفحة.");
      return;
    }
    if (!trimmedName) {
      toast.error("يرجى إدخال عنوان الخصم");
      return;
    }
    if (!trimmedDesc) {
      toast.error("يرجى إدخال وصف الخصم");
      return;
    }
    if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
      toast.error("يرجى إدخال نسبة خصم صحيحة (1–100)");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("يرجى تحديد تاريخ البدء والنفاذ");
      return;
    }
    if (!imageFile) {
      toast.error("يرجى اختيار صورة للخصم");
      return;
    }

    const tempImageUrl = resolveTempImageUrl(storeDetails);
    if (!tempImageUrl) {
      toast.error("تعذر تجهيز صورة الخصم. حاول تحديث الصفحة.");
      return;
    }

    createDiscount(
      {
        storeId,
        name: trimmedName,
        description: trimmedDesc,
        discount_percentage: pct,
        discount_start_date: startDate,
        discount_end_date: endDate,
        discount_status: isActive
          ? DISCOUNT_STATUS.ACTIVE
          : DISCOUNT_STATUS.INACTIVE,
        image: tempImageUrl,
        imageFile,
      },
      {
      onSuccess: (data) => {
        toast.success("تم إنشاء الخصم بنجاح");
        reset();
        onOpenChange(false);
        onSuccess?.(data.id);
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, "فشل في إنشاء الخصم"));
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
              <h2 className="text-xl font-bold text-blue-950">إضافة خصم جديد</h2>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-100">
                <HugeiconsIcon icon={PercentIcon} size={24} className="text-violet-600" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SettingsField label="صورة الخصم" htmlFor="discountImage">
              <div className="flex items-start gap-3">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="معاينة صورة الخصم"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs text-slate-400">
                      لا توجد صورة
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    id="discountImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isPending}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPending}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                    >
                      <Upload className="size-4" />
                      {imageFile ? "تغيير الصورة" : "اختر صورة"}
                    </button>
                    {imageFile && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isPending}
                        className="inline-flex h-10 items-center rounded-xl bg-rose-50 px-3 text-sm font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                      >
                        إزالة
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">PNG أو JPG حتى 2MB</p>
                </div>
              </div>
            </SettingsField>

            <SettingsField label="عنوان الخصم" htmlFor="discountName">
              <SettingsInput
                id="discountName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: خصم نهاية السنة 75%"
                disabled={isPending}
              />
            </SettingsField>

            <SettingsField label="وصف الخصم" htmlFor="discountDesc">
              <SettingsTextarea
                id="discountDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اشرح تفاصيل العرض للعملاء..."
                rows={3}
                disabled={isPending}
              />
            </SettingsField>

            <SettingsField label="نسبة الخصم" htmlFor="discountPct">
              <SettingsInput
                id="discountPct"
                type="number"
                min={1}
                max={100}
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="75"
                disabled={isPending}
              />
            </SettingsField>

            <div className="grid grid-cols-2 gap-3">
              <SettingsField label="تاريخ البدء" htmlFor="discountStart">
                <SettingsInput
                  id="discountStart"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isPending}
                />
              </SettingsField>
              <SettingsField label="تاريخ النفاذ" htmlFor="discountEnd">
                <SettingsInput
                  id="discountEnd"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isPending}
                />
              </SettingsField>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">حالة الخصم</span>
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
                  جاري الحفظ...
                </>
              ) : (
                "حفظ"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDiscountDialog;

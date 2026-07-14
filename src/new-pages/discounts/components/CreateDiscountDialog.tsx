import { useRef, useState } from "react";
import { Calendar, Loader2, Package, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useCreateDiscount } from "@/api/wrappers/discount.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { useFetchCurrentSettings } from "@/api/wrappers/settings.wrappers";
import { DISCOUNT_STATUS } from "@/utils/constants";
import {
  SettingsField,
  SettingsInput,
  SettingsTextarea,
  settingsInputClassName,
} from "@/new-pages/settings/components/SettingsField";
import { cn } from "@/lib/utils";

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
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;

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
      toast.error("يرجى إدخال عنوان الخيار");
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
      },
    );
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
        className="max-w-lg gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-xl"
      >
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex size-9 items-center justify-center rounded-xl bg-violet-100 text-[#1a2b5a] hover:bg-violet-200 disabled:opacity-50"
              aria-label="إغلاق"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <DialogTitle className="text-lg font-bold text-[#1a2b5a]">
                أضافة خيار منتج جديد
              </DialogTitle>
              <div className="relative flex size-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Package className="size-5" strokeWidth={2} />
                <span className="absolute -bottom-0.5 -left-0.5 flex size-4 items-center justify-center rounded-full bg-[#00b7ff] text-white">
                  <Plus className="size-2.5" strokeWidth={3} />
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SettingsField label="عنوان الخيار" htmlFor="discountName">
              <SettingsInput
                id="discountName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="خصم نهاية السنة 75%"
                disabled={isPending}
              />
            </SettingsField>

            <SettingsField label="وصف الخصم" htmlFor="discountDesc">
              <SettingsTextarea
                id="discountDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ودع السنة بقطعة جديدة وتوفير أكيد. خصوماتنا بدأت الآن!"
                rows={3}
                disabled={isPending}
                className="min-h-[88px] border border-transparent focus-visible:border-[#00b7ff] focus-visible:ring-0"
              />
            </SettingsField>

            <SettingsField label="نسبة الخصم" htmlFor="discountPct">
              <div className="relative">
                <SettingsInput
                  id="discountPct"
                  type="number"
                  min={1}
                  max={100}
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="75"
                  disabled={isPending}
                  className="pl-10"
                />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                  %
                </span>
              </div>
            </SettingsField>

            {/* حالة الخصم — يمين العنوان / يسار التبديل */}
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-sm font-medium text-slate-500">
                حالة الخصم
              </span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onToggle={setIsActive}
                  disabled={isPending}
                />
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-teal-600" : "text-slate-400",
                  )}
                >
                  {isActive ? "نشطة" : "معطلة"}
                </span>
              </div>
            </div>

            {/* التواريخ */}
            <div className="grid grid-cols-2 gap-3">
              <SettingsField label="تاريخ البدأ" htmlFor="discountStart">
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="discountStart"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isPending}
                    className={cn(
                      settingsInputClassName,
                      "w-full pl-10 text-right",
                    )}
                  />
                </div>
              </SettingsField>
              <SettingsField label="تاريخ النفاذ" htmlFor="discountEnd">
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="discountEnd"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isPending}
                    placeholder="ادخل تاريخ نفاذ الخصم"
                    className={cn(
                      settingsInputClassName,
                      "w-full pl-10 text-right",
                    )}
                  />
                </div>
              </SettingsField>
            </div>

            {/* صورة — مطلوبة للـ API وغير ظاهرة في الموكب بشكل بارز */}
            <SettingsField label="صورة الخصم" htmlFor="discountImage">
              <div className="flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="معاينة"
                      className="size-full object-cover"
                    />
                  ) : (
                    <Upload className="size-5 text-slate-300" />
                  )}
                </div>
                <div className="flex flex-1 flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    id="discountImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                  >
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
              </div>
            </SettingsField>
          </div>

          {/* Actions — يمين إلغاء / يسار حفظ */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-12 rounded-2xl bg-slate-100 text-sm font-semibold text-[#1a2b5a] hover:bg-slate-200 disabled:opacity-50"
            >
              الغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#00b7ff] text-sm font-semibold text-white hover:bg-[#00a3e6] disabled:opacity-50"
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

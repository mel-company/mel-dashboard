import { useRef, useState } from "react";
import { Calendar, Loader2, Percent, Upload } from "lucide-react";
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

const darkFieldClass =
  "dark:border-0 dark:bg-[#0a0e27]/80 dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596] dark:focus-visible:ring-[#00b7ff]/30";

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
    if (file.size > 50 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 50MB");
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
      toast.error("يرجى إدخال رمز الخصم");
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
        className="max-h-[92dvh] max-w-lg gap-0 overflow-y-auto rounded-[2rem] border-0 p-0 shadow-xl sm:max-w-[792px] dark:bg-[#12183b]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col p-6 sm:p-6">
          <div className="mb-6 flex items-start justify-end gap-3 border-b border-slate-100 pb-5 dark:border-[#1f2448]">
            <div className="min-w-0 text-right">
              <DialogTitle className="text-xl font-normal text-slate-900 dark:text-[#e4e7fc]">
                اضافة خصم جديد
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
            <SettingsField label="رمز الخصم" htmlFor="discountName">
              <SettingsInput
                id="discountName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب رمز الخصم"
                disabled={isPending}
                className={cn("h-12 rounded-[14px]", darkFieldClass)}
              />
            </SettingsField>

            <SettingsField label="وصف الخصم" htmlFor="discountDesc">
              <SettingsTextarea
                id="discountDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصف يوضح محتويات الفئة"
                rows={4}
                disabled={isPending}
                className={cn(
                  "min-h-[136px] rounded-[14px] border-0 focus-visible:ring-0",
                  darkFieldClass,
                )}
              />
            </SettingsField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <SettingsField label="نسبة الخصم" htmlFor="discountPct">
                <div className="relative">
                  <SettingsInput
                    id="discountPct"
                    type="number"
                    min={1}
                    max={100}
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="نسبة الخصم"
                    disabled={isPending}
                    className={cn("h-12 rounded-[14px] pl-12", darkFieldClass)}
                  />
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 dark:text-[#8e99f3]">
                    %
                  </span>
                </div>
              </SettingsField>

              <SettingsField label="صورة الخصم" htmlFor="discountImage">
                <div className="flex h-12 items-center gap-2">
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-slate-100 dark:bg-[#0a0e27]/80">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="معاينة"
                        className="size-full object-cover"
                      />
                    ) : (
                      <Upload className="size-4 text-slate-300 dark:text-[#4a5596]" />
                    )}
                  </div>
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
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-[14px] bg-slate-100 px-3 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-[#0a0e27]/80 dark:text-[#a4b1fa] dark:hover:bg-[#0a0e27]"
                  >
                    {imageFile ? "تغيير الصورة" : "اختر صورة"}
                  </button>
                  {imageFile ? (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isPending}
                      className="inline-flex h-12 items-center rounded-[14px] bg-rose-50 px-3 text-sm font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50 dark:bg-[#ff5252]/10 dark:text-[#ff5252]"
                    >
                      إزالة
                    </button>
                  ) : null}
                </div>
              </SettingsField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <SettingsField label="تاريخ البدء والنفاذ">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400 dark:text-[#e4e7fc]/30" />
                    <input
                      id="discountStart"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
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
                      id="discountEnd"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
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
                  حالة الخصم
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
                "أضافة الخصم"
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

export default CreateDiscountDialog;

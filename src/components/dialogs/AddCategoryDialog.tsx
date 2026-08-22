import { useState, useRef } from "react";
import { ChevronDown, CloudUpload, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useCreateCategory } from "@/api/wrappers/category.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { resolveTempImageUrl } from "@/utils/resolve-temp-image-url";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const fieldClass =
  "w-full rounded-[14px] border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/30 dark:bg-[#0a0e27]/80 dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]";

const labelClass =
  "block text-right text-sm font-medium text-slate-500 dark:text-[#a4b1fa]";

const AddCategoryDialog = ({ open, onOpenChange }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [categoryKind, setCategoryKind] = useState<"main" | "sub">("main");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createCategory, isPending } = useCreateCategory();
  const { data: storeDetails } = useFetchStoreDetails();

  const reset = () => {
    setName("");
    setDescription("");
    setEnabled(true);
    setCategoryKind("main");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("enabled", enabled.toString());
    if (imageFile) {
      const tempImageUrl = resolveTempImageUrl(storeDetails);
      if (!tempImageUrl) {
        toast.error(
          "تعذر تجهيز صورة الفئة. ارفع شعار المتجر من الإعدادات ثم حاول مرة أخرى.",
        );
        return;
      }
      formData.append("image", imageFile);
      formData.append("tempImageUrl", tempImageUrl);
    }

    createCategory(formData, {
      onSuccess: () => {
        toast.success("تم إضافة الفئة بنجاح");
        reset();
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "فشل في إضافة الفئة. حاول مرة أخرى.",
        );
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
        className="max-h-[92dvh] gap-0 overflow-y-auto rounded-[2rem] border-0 bg-white p-0 text-right shadow-2xl sm:max-w-md dark:bg-[#12183b]"
      >
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-6">
          <div className="mb-6 flex items-start justify-between gap-3 border-b border-slate-100 pb-5 dark:border-[#1f2448]">
            <div className="min-w-0 text-right">
              <DialogTitle className="text-xl font-normal text-slate-900 dark:text-[#e4e7fc]">
                أضافة فئة جديدة
              </DialogTitle>
              <p className="mt-0.5 text-sm text-slate-400 dark:text-[#a4b1fa]">
                يرجى ادخال جميع الحقول لاتمام عملية الاضافة
              </p>
            </div>
            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 dark:bg-[#9a5cff]/15">
              <Package className="size-5 text-violet-600 dark:text-[#b282ff]" />
              <span className="absolute -bottom-0.5 -start-0.5 flex size-4 items-center justify-center rounded-full bg-[#00b7ff] text-[10px] font-bold text-white">
                +
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="category-name" className={labelClass}>
                اسم الفئة
              </label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أكتب اسم الفئة"
                required
                disabled={isPending}
                className={cn(fieldClass, "h-12")}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="category-description" className={labelClass}>
                وصف الفئة
              </label>
              <textarea
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصف يوضح محتويات الفئة"
                required
                disabled={isPending}
                rows={4}
                className={cn(fieldClass, "min-h-[136px] resize-none")}
              />
            </div>

            <div className="space-y-2">
              <p className={labelClass}>صورة الفئة</p>
              <input
                ref={fileInputRef}
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
                className="flex h-[236px] w-full flex-col items-center justify-center gap-3.5 overflow-hidden rounded-[24px] border-[1.8px] border-[#00b7ff]/15 bg-[#33c5ff]/5 text-[#33c5ff] transition-colors hover:bg-[#33c5ff]/10 disabled:opacity-50"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="معاينة"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <>
                    <CloudUpload className="size-10" strokeWidth={1.5} />
                    <span className="text-xl">رفع صورة جديدة</span>
                  </>
                )}
              </button>
              {imageFile ? (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-rose-500"
                >
                  إزالة الصورة
                </button>
              ) : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="category-kind" className={labelClass}>
                نوع الفئة
              </label>
              <div className="relative">
                <select
                  id="category-kind"
                  value={categoryKind}
                  onChange={(e) =>
                    setCategoryKind(e.target.value as "main" | "sub")
                  }
                  disabled={isPending}
                  className={cn(
                    fieldClass,
                    "h-12 appearance-none pe-4 ps-10",
                  )}
                >
                  <option value="main">فئة رئيسية</option>
                  <option value="sub">فئة فرعية</option>
                </select>
                <ChevronDown className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 dark:text-[#e4e7fc]" />
              </div>
            </div>

            <div className="space-y-1">
              <p className={labelClass}>حالة الفئة</p>
              <Switch
                checked={enabled}
                onToggle={setEnabled}
                activeLabel="مفعل"
                disabledLabel="معطل"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-[#b282ff] to-[#33c5ff] text-lg font-bold text-white disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                "أضافة الفئة"
              )}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="flex h-[60px] w-full items-center justify-center text-lg font-bold text-slate-400 dark:text-[#4a5596]"
            >
              الغاء
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;

import { useState, useRef } from "react";
import { ChevronDown, CloudUpload, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";
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
  const isMobile = useIsMobile();
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
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      {/* Figma presents every create form as a full-height edge drawer. */}
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        dir="rtl"
        showCloseButton={false}
        className={cn(
          "z-[60] flex flex-col gap-0 border-0 p-0 text-right text-foreground",
          "bg-white dark:bg-[#12183b]",
          isMobile
            ? cn(
                "inset-x-0 bottom-0 top-auto h-auto max-h-[92dvh] w-full max-w-none rounded-t-[32px]",
                "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
              )
            : cn(
                "top-3 bottom-3 left-3 h-auto w-[min(100%,560px)] max-w-[560px] rounded-[32px]",
                "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
              ),
        )}
      >
        {isMobile ? (
          <div className="flex shrink-0 justify-center pt-3">
            <span className="h-1.5 w-12 rounded-full bg-border" />
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="shrink-0 flex-row-reverse items-start justify-between gap-3 space-y-0 border-b border-slate-100 px-5 py-5 text-right sm:px-6 dark:border-[#1f2448]">
            <div className="min-w-0 text-right">
              <SheetTitle className="text-xl font-normal text-slate-900 dark:text-[#e4e7fc]">
                أضافة فئة جديدة
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-sm text-slate-400 dark:text-[#a4b1fa]">
                يرجى ادخال جميع الحقول لاتمام عملية الاضافة
              </SheetDescription>
            </div>
            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 dark:bg-[#9a5cff]/15">
              <Package className="size-5 text-violet-600 dark:text-[#b282ff]" />
              <span className="absolute -bottom-0.5 -start-0.5 flex size-4 items-center justify-center rounded-full bg-[#00b7ff] text-[10px] font-bold text-white">
                +
              </span>
            </div>
          </SheetHeader>

          <div className="custom-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-6">
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

          <SheetFooter
            className={cn(
              "shrink-0 border-t border-slate-100 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 dark:border-[#1f2448]",
              isMobile
                ? "flex-col gap-3 sm:flex-col"
                : "flex-row items-center justify-between gap-3 sm:flex-row sm:space-x-0",
            )}
          >
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "flex h-[60px] items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-[#b282ff] to-[#33c5ff] text-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50",
                isMobile ? "w-full" : "min-w-[200px] px-10",
              )}
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
              className={cn(
                "text-lg font-bold text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50 dark:text-[#4a5596] dark:hover:text-[#e4e7fc]",
                isMobile ? "h-auto w-full py-2 text-center" : "h-[60px] min-w-[140px]",
              )}
            >
              الغاء
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddCategoryDialog;

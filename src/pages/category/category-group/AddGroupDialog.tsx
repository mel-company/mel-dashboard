import { useMemo, useRef, useState } from "react";
import { ChevronDown, CloudUpload, Layers, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useCreateGroup, useAddCategoriesToGroup } from "@/api/wrappers/group.wrappers";
import { useFetchCategories } from "@/api/wrappers/category.wrappers";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const fieldClass =
  "w-full rounded-[14px] border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/30 dark:bg-[#0a0e27]/80 dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]";

const labelClass =
  "block text-right text-sm font-medium text-slate-500 dark:text-[#a4b1fa]";

type CategoryOption = { id: string; name: string };

function normalizeCategories(data: any): CategoryOption[] {
  const list = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];
  return list
    .map((c: any) => ({ id: String(c?.id ?? ""), name: c?.name ?? "" }))
    .filter((c: CategoryOption) => c.id && c.name);
}

const AddGroupDialog = ({ open, onOpenChange }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState<CategoryOption[]>([]);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createGroup, isPending: isCreating } = useCreateGroup();
  const { mutate: addCategories, isPending: isLinking } = useAddCategoriesToGroup();
  const { data: categoriesData } = useFetchCategories({ limit: 200 }, open);
  const isPending = isCreating || isLinking;

  const allCategories = useMemo(
    () => normalizeCategories(categoriesData),
    [categoriesData],
  );

  const selectedIds = useMemo(
    () => new Set(selected.map((c) => c.id)),
    [selected],
  );

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    return allCategories
      .filter((c) => !selectedIds.has(c.id))
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [allCategories, categoryQuery, selectedIds]);

  const reset = () => {
    setName("");
    setDescription("");
    setEnabled(true);
    setSelected([]);
    setCategoryQuery("");
    setPickerOpen(false);
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

  const finish = () => {
    toast.success("تم إضافة المجموعة بنجاح");
    reset();
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("enabled", enabled.toString());
    if (imageFile) formData.append("image", imageFile);

    createGroup(formData, {
      onSuccess: (data) => {
        const groupId = data?.id;
        const categoryIds = selected.map((c) => c.id);
        if (groupId && categoryIds.length > 0) {
          addCategories(
            { groupId, categoryIds },
            {
              onSuccess: finish,
              onError: () => {
                toast.warning("تم إنشاء المجموعة لكن فشل ربط الفئات");
                finish();
              },
            },
          );
          return;
        }
        finish();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "فشل في إضافة المجموعة. حاول مرة أخرى.",
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
        className="max-h-[92dvh] gap-0 overflow-y-auto rounded-[2rem] border-0 bg-white p-0 text-right shadow-2xl sm:max-w-[792px] dark:bg-[#12183b]"
      >
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-6">
          <div className="mb-6 flex items-start justify-between gap-3 border-b border-slate-100 pb-5 dark:border-[#1f2448]">
            <div className="min-w-0 text-right">
              <DialogTitle className="text-xl font-normal text-slate-900 dark:text-[#e4e7fc]">
                أضافة مجموعة جديدة
              </DialogTitle>
              <p className="mt-0.5 text-sm text-slate-400 dark:text-[#a4b1fa]">
                يرجى ادخال جميع الحقول لاتمام عملية الاضافة
              </p>
            </div>
            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 dark:bg-[#9a5cff]/15">
              <Layers className="size-5 text-violet-600 dark:text-[#b282ff]" />
              <span className="absolute -bottom-0.5 -start-0.5 flex size-4 items-center justify-center rounded-full bg-[#00b7ff] text-[10px] font-bold text-white">
                +
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-stretch">
              <div className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="group-name" className={labelClass}>
                    اسم المجموعة
                  </label>
                  <input
                    id="group-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أكتب اسم المجموعة"
                    required
                    disabled={isPending}
                    className={cn(fieldClass, "h-12")}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="group-description" className={labelClass}>
                    وصف المجموعة
                  </label>
                  <textarea
                    id="group-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اكتب وصف يوضح محتويات المجموعة"
                    disabled={isPending}
                    rows={5}
                    className={cn(fieldClass, "min-h-[136px] resize-none sm:min-h-[180px]")}
                  />
                </div>
              </div>

              <div className="flex h-full flex-col gap-2">
                <p className={labelClass}>صورة المجموعة</p>
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
                  className="flex h-[180px] w-full flex-col items-center justify-center gap-3.5 overflow-hidden rounded-[24px] border-[1.8px] border-[#00b7ff]/15 bg-[#33c5ff]/5 text-[#33c5ff] transition-colors hover:bg-[#33c5ff]/10 disabled:opacity-50 sm:h-full sm:min-h-[236px]"
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
            </div>

            <div className="space-y-2">
              <p className={labelClass}>أختيار الاصناف</p>
              <div className="relative">
                <Search className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-[#4a5596]" />
                <input
                  type="search"
                  value={categoryQuery}
                  onChange={(e) => {
                    setCategoryQuery(e.target.value);
                    setPickerOpen(true);
                  }}
                  onFocus={() => setPickerOpen(true)}
                  onBlur={() => setTimeout(() => setPickerOpen(false), 150)}
                  placeholder="البحث عن الاصناف المناسبة"
                  disabled={isPending}
                  className={cn(fieldClass, "h-12 pe-10 ps-10")}
                />
                <ChevronDown className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 dark:text-[#e4e7fc]" />
                {pickerOpen && filteredCategories.length > 0 ? (
                  <ul className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-2xl border border-slate-100 bg-white py-1 shadow-lg dark:border-[#1f2448] dark:bg-[#0a0e27]">
                    {filteredCategories.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelected((prev) => [...prev, c]);
                            setCategoryQuery("");
                          }}
                          className="w-full px-4 py-2.5 text-right text-sm text-slate-800 hover:bg-slate-50 dark:text-[#e4e7fc] dark:hover:bg-white/5"
                        >
                          {c.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {selected.length > 0 ? (
                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  {selected.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-sm text-violet-700 dark:border-[#31396e] dark:text-[#b282ff]"
                    >
                      {c.name}
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          setSelected((prev) => prev.filter((x) => x.id !== c.id))
                        }
                        className="flex size-4 items-center justify-center rounded-full bg-[#ff5252] text-white"
                        aria-label={`إزالة ${c.name}`}
                      >
                        <X className="size-2.5" strokeWidth={3} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <p className={labelClass}>حالة المجموعة</p>
              <Switch
                checked={enabled}
                onToggle={setEnabled}
                activeLabel="مفعل"
                disabledLabel="معطل"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={isPending}
              className="flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-[#b282ff] to-[#33c5ff] text-lg font-bold text-white disabled:opacity-50 sm:flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                "أضافة المجموعة"
              )}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="flex h-[60px] w-full items-center justify-center text-lg font-bold text-slate-400 dark:text-[#4a5596] sm:w-auto sm:px-8"
            >
              الغاء
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupDialog;

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  ExternalLink,
  Loader2,
  Palette,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApplyDesign } from "@/api/wrappers/design.wrappers";
import { resolveDemoUrl } from "@/api/endpoints/design.endpoints";
import type { StoreDesign } from "@/api/endpoints/design.endpoints";

type Props = {
  design: StoreDesign | null;
  onOpenChange: (open: boolean) => void;
};

const DesignApplyDialog = ({ design, onOpenChange }: Props) => {
  const { mutate: applyDesign, isPending } = useApplyDesign();
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const demoUrl = design ? resolveDemoUrl(design) : null;

  // A different design is a different decision — never open onto the previous
  // run's success screen.
  useEffect(() => {
    setStoreUrl(null);
    setCopied(false);
  }, [design?.id]);

  const handleConfirm = () => {
    if (!design?.id) return;

    applyDesign(design.id, {
      onSuccess: (data) => {
        if (data?.success) {
          setStoreUrl(data.url ?? null);
          toast.success("تم تطبيق التصميم ونشر متجرك");
          return;
        }

        // A 200 with success:false — the server got as far as `stage` and
        // stopped. The dialog stays open so the merchant can simply retry.
        const where =
          data?.stage === "deploy"
            ? "فشل نشر المتجر بالتصميم الجديد"
            : "فشل تجهيز المتجر للتصميم الجديد";
        toast.error(data?.error || data?.message || where);
      },
      onError: (error: any) => {
        if (error?.code === "ECONNABORTED") {
          // The deploy may well have finished after we stopped waiting, so
          // "failed" would be a guess — and the wrong one more often than not.
          toast.error(
            "استغرق النشر وقتاً أطول من المتوقع. حدّث الصفحة بعد قليل للتحقق من حالة متجرك.",
          );
          return;
        }
        toast.error(
          error?.response?.data?.message || "تعذر تطبيق التصميم، حاول مرة أخرى",
        );
      },
    });
  };

  const handleCopy = async () => {
    if (!storeUrl) return;
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("تعذر نسخ الرابط");
    }
  };

  const handleClose = () => {
    if (isPending) return;
    onOpenChange(false);
  };

  return (
    <Dialog
      open={!!design}
      onOpenChange={(open) => !isPending && onOpenChange(open)}
    >
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-h-[92dvh] gap-6 overflow-y-auto rounded-[2rem] border-0 bg-white p-6 text-right shadow-2xl sm:max-w-[620px] dark:bg-[#12183b]"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-[#e4e7fc]">
            {storeUrl ? "تم تطبيق التصميم" : "تغيير تصميم المتجر"}
          </DialogTitle>
          <button
            type="button"
            disabled={isPending}
            onClick={handleClose}
            className="flex size-11 items-center justify-center rounded-[14px] border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* The design being applied — the thing the decision is about. */}
        <div className="flex items-center gap-4 rounded-[20px] bg-slate-100 p-4 dark:bg-slate-900">
          <div className="h-[72px] w-[110px] shrink-0 overflow-hidden rounded-[10px] bg-white shadow-sm dark:bg-slate-800">
            {design?.thumbnail ? (
              <img
                src={design.thumbnail}
                alt=""
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Palette className="size-6 text-slate-300" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-slate-900 dark:text-[#e4e7fc]">
              {design?.storeName || "تصميم بدون اسم"}
            </p>
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              {design?.tagline || design?.prompt}
            </p>
            {/* The last chance to look before a switch that replaces the
                store's pages and brand and cannot be undone from here. Opened
                in a new tab rather than navigated to, so the decision they
                came here to make is still on screen when they come back. Gone
                once the switch has landed — by then the live store is the
                link that matters, and it is already offered below. */}
            {demoUrl && !storeUrl ? (
              <a
                href={demoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-sky-600 underline-offset-4 hover:underline dark:text-sky-400"
              >
                <Eye className="size-3.5" />
                معاينة حيّة قبل التطبيق
              </a>
            ) : null}
          </div>
        </div>

        {storeUrl ? (
          <>
            <DialogDescription className="text-center text-base text-slate-600 dark:text-[#a4b1fa]">
              متجرك يعمل الآن بالتصميم الجديد.
            </DialogDescription>
            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <Button
                asChild
                className="h-12 w-full rounded-2xl text-base font-bold"
              >
                <a href={storeUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  افتح المتجر
                </a>
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopy}
                className="h-12 w-full rounded-2xl text-base font-bold"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? "تم النسخ" : "نسخ الرابط"}
              </Button>
            </div>
          </>
        ) : isPending ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="size-9 animate-spin text-primary" />
            <p className="text-lg font-bold text-slate-800 dark:text-[#e4e7fc]">
              جارٍ تطبيق التصميم ونشر المتجر…
            </p>
            <p className="max-w-[26rem] text-sm leading-6 text-slate-400 dark:text-[#a4b1fa]">
              قد تستغرق العملية دقيقة تقريباً. لا تغلق هذه النافذة.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-right dark:border-amber-500/20 dark:bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-5 shrink-0" />
                <p className="text-[15px] font-bold">قبل المتابعة</p>
              </div>
              {/* A generated design is a brand as well as a layout — its
                  palette and fonts travel with its pages, which is not what
                  the merchant expects unless it is said plainly. */}
              <ul className="list-inside list-disc space-y-1.5 text-[13px] leading-6 text-amber-800 dark:text-amber-200/80">
                <li>سيتم استبدال صفحات متجرك بصفحات هذا التصميم.</li>
                <li>ستتغيّر ألوان متجرك وخطوطه وشعاره إلى ألوان هذا التصميم.</li>
                <li>أي تعديلات أجريتها في محرر الموقع ستفقد.</li>
                <li>سيُعاد بناء متجرك ونشره، وتستغرق العملية دقيقة تقريباً.</li>
              </ul>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row-reverse sm:gap-6">
              <Button
                type="button"
                disabled={isPending || !design}
                onClick={handleConfirm}
                className="h-12 w-full rounded-2xl text-base font-bold sm:h-[54px]"
              >
                تطبيق التصميم ونشر المتجر
              </Button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleClose}
                className="flex h-11 w-full items-center justify-center text-base font-bold text-slate-700 transition-colors hover:text-slate-900 disabled:opacity-50 sm:h-[54px] dark:text-[#e4e7fc]"
              >
                إلغاء
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DesignApplyDialog;

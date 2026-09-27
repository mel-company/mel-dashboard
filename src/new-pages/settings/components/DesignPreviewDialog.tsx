import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, ImageOff } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveDemoUrl } from "@/api/endpoints/design.endpoints";
import type { StoreDesign } from "@/api/endpoints/design.endpoints";

type Props = {
  design: StoreDesign | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * The design, running.
 *
 * A screenshot says what a design looks like; this is for walking through it —
 * following the nav, opening a category, seeing a product page — which is the
 * part a merchant actually judges a design on. The page it frames is public
 * and renders an invented catalogue, so the same address is the one they can
 * send to someone whose opinion they want.
 */
const DesignPreviewDialog = ({ design, onOpenChange }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const demoUrl = design ? resolveDemoUrl(design) : null;

  // Each design is a fresh load, so the skeleton has to come back with it —
  // otherwise the second design opens showing the first one's frame.
  useEffect(() => {
    setLoaded(false);
    setCopied(false);
  }, [design?.id]);

  const handleCopy = async () => {
    if (!demoUrl) return;
    try {
      await navigator.clipboard.writeText(demoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("تعذر نسخ الرابط");
    }
  };

  return (
    <Dialog open={!!design} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="flex max-h-[92dvh] max-w-5xl flex-col overflow-hidden text-right"
      >
        <DialogHeader>
          <DialogTitle className="text-right">
            {design?.storeName || "معاينة التصميم"}
          </DialogTitle>
          <DialogDescription className="text-right">
            معاينة حيّة بمنتجات تجريبية. يمكنك مشاركة الرابط مع أي شخص.
          </DialogDescription>
        </DialogHeader>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[14px] border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
          {demoUrl ? (
            <>
              {!loaded ? (
                <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
              ) : null}
              <iframe
                key={design?.id}
                src={demoUrl}
                title={`معاينة ${design?.storeName ?? "التصميم"}`}
                onLoad={() => setLoaded(true)}
                // The demo is a different origin in production (the API host)
                // and renders only its own inlined payload, so it needs scripts
                // and its own origin — and nothing else.
                sandbox="allow-scripts allow-same-origin"
                className="h-[65vh] w-full border-0 bg-white"
              />
            </>
          ) : design?.thumbnail ? (
            <img
              src={design.thumbnail}
              alt={design.storeName ?? "التصميم"}
              className="h-[65vh] w-full object-contain"
            />
          ) : (
            <div className="flex h-[40vh] flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff className="size-10" />
              <p className="text-sm">المعاينة غير متاحة لهذا التصميم</p>
            </div>
          )}
        </div>

        {demoUrl ? (
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button asChild variant="secondary" className="gap-2">
              <a href={demoUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                فتح في تبويب جديد
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "تم نسخ الرابط" : "نسخ رابط المعاينة"}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default DesignPreviewDialog;

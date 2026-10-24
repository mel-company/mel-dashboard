import { Check, Loader2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type {
  TamimaProposedAction,
  TamimaUiHint,
} from "@/api/endpoints/tamima.endpoints";
import {
  useApproveTamimaAction,
  useRejectTamimaAction,
  useTamimaAction,
} from "@/api/wrappers/tamima.wrappers";
import { productKeys } from "@/api/wrappers/product.wrappers";
import { storeKeys } from "@/api/wrappers/store.wrappers";
import { settingsKeys } from "@/api/wrappers/settings.wrappers";
import { useTamimaBackgroundRefresh } from "@/components/tamima/TamimaBackgroundRefresh";
import { cn } from "@/lib/utils";

type ActionApprovalProps = {
  action?: TamimaProposedAction;
  actionId?: string;
  onResolved?: (action: TamimaProposedAction) => void;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "بانتظار موافقتك",
  EXECUTING: "جارٍ التنفيذ…",
  APPLIED: "تم التنفيذ",
  REJECTED: "مرفوض",
  EXPIRED: "انتهت الصلاحية",
  STALE: "تغيّرت البيانات",
  FAILED: "فشل التنفيذ",
};

function deriveUiHint(action: TamimaProposedAction): TamimaUiHint {
  if (action.ui?.navigateTo) return action.ui;
  const payload = action.payload || {};
  const productId =
    typeof payload.productId === "string" ? payload.productId : undefined;
  const kind = String(action.kind);

  if (kind === "REGENERATE_PRODUCT_IMAGE") {
    return {
      navigateTo: productId ? `/products/${productId}` : "/products",
      productId,
      refresh: ["product", "products"],
      storefrontLive: true,
      needsPublish: false,
      toast: "تم توليد صورة جديدة للمنتج.",
    };
  }
  if (
    productId &&
    (kind.startsWith("UPDATE_PRODUCT") || kind === "SET_PRODUCT_ACTIVE")
  ) {
    return {
      navigateTo: `/products/${productId}`,
      productId,
      refresh: ["product", "products"],
      storefrontLive: true,
      needsPublish: false,
      toast: "تم تطبيق التعديل على المنتج.",
    };
  }
  if (kind.startsWith("UPDATE_STORE")) {
    return {
      navigateTo: "/settings",
      refresh: ["store", "settings"],
      storefrontLive: true,
      needsPublish: false,
      toast: "تم تحديث بيانات المتجر.",
    };
  }
  if (kind === "UPDATE_THEME_PRIMARY") {
    return {
      navigateTo: "/editor",
      refresh: ["store", "theme"],
      storefrontLive: false,
      needsPublish: true,
      toast: "تحدّث اللون بالمسودة — انشر حتى يراه الزبائن.",
    };
  }
  return {
    navigateTo: "/",
    refresh: ["store"],
    storefrontLive: true,
    needsPublish: false,
    toast: "تم تنفيذ الإجراء.",
  };
}

function payloadLines(action: TamimaProposedAction): string[] {
  const payload = action.payload || {};
  const baseline = (payload.baseline || {}) as Record<string, unknown>;
  const lines: string[] = [];
  const title = baseline.title ?? payload.productTitle ?? baseline.name;
  if (title) lines.push(`العنصر: ${String(title)}`);

  if (action.kind === "UPDATE_PRODUCT_PRICE") {
    if (baseline.price !== undefined) {
      lines.push(`السعر الحالي: ${String(baseline.price)}`);
    }
    if (payload.newPrice !== undefined) {
      lines.push(`السعر الجديد: ${String(payload.newPrice)}`);
    }
  }
  if (action.kind === "UPDATE_PRODUCT_NAME" && payload.newName) {
    lines.push(`الاسم الجديد: ${String(payload.newName)}`);
  }
  if (action.kind === "UPDATE_PRODUCT_DESCRIPTION" && payload.newDescription) {
    lines.push(`الوصف الجديد: ${String(payload.newDescription).slice(0, 120)}`);
  }
  if (action.kind === "SET_PRODUCT_ACTIVE" && payload.isActive !== undefined) {
    lines.push(
      `الحالة: ${payload.isActive ? "تفعيل المنتج" : "إيقاف المنتج"}`,
    );
  }
  if (action.kind === "REGENERATE_PRODUCT_IMAGE") {
    const mode = String(payload.imageEditMode || "").toLowerCase();
    const modeLabel: Record<string, string> = {
      enhance: "تحسين",
      enlarge: "تكبير",
      arrange: "ترتيب",
      restyle: "إعادة تنسيق",
    };
    if (mode && modeLabel[mode]) lines.push(`النوع: ${modeLabel[mode]}`);
    const prompt = payload.imagePrompt ?? payload.prompt;
    if (prompt) lines.push(`وصف الصورة: ${String(prompt).slice(0, 140)}`);
    if (payload.hasMerchantAttachment) {
      lines.push("المصدر: صورة مرفقة منك");
    } else if (payload.useProductImage || payload.referenceImageKey) {
      lines.push("المصدر: صورة المنتج الحالية");
    }
  }
  if (action.kind === "UPDATE_STORE_NAME" && payload.newName) {
    lines.push(`اسم المتجر الجديد: ${String(payload.newName)}`);
  }
  if (action.kind === "UPDATE_THEME_PRIMARY" && payload.hexColor) {
    lines.push(`اللون: ${String(payload.hexColor)}`);
  }
  return lines;
}

export function ActionApproval({
  action: actionProp,
  actionId,
  onResolved,
}: ActionApprovalProps) {
  const queryClient = useQueryClient();
  const { refreshBackground } = useTamimaBackgroundRefresh();
  const id = actionProp?.id || actionId || null;
  const fetched = useTamimaAction(id, !actionProp && !!id);
  const action = actionProp || fetched.data;

  const approve = useApproveTamimaAction();
  const reject = useRejectTamimaAction();
  const busy = approve.isPending || reject.isPending;

  if (!action) {
    if (fetched.isLoading) {
      return (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          جارٍ تحميل الإجراء…
        </div>
      );
    }
    return null;
  }

  const pending = String(action.status) === "PENDING";
  const statusKey = String(action.status);
  const statusLabel = STATUS_LABEL[statusKey] || statusKey;
  const detailLines = payloadLines(action);

  const applySideEffects = (next: TamimaProposedAction) => {
    const ui = deriveUiHint(next);
    for (const key of ui.refresh) {
      if (key === "product" || key === "products") {
        void queryClient.invalidateQueries({ queryKey: productKeys.all });
        if (ui.productId) {
          void queryClient.invalidateQueries({
            queryKey: productKeys.detail(ui.productId),
          });
        }
      }
      if (key === "store") {
        void queryClient.invalidateQueries({ queryKey: storeKeys.all });
      }
      if (key === "settings" || key === "theme") {
        void queryClient.invalidateQueries({ queryKey: settingsKeys.all });
        void queryClient.invalidateQueries({ queryKey: storeKeys.all });
      }
    }

    toast.success(ui.toast);
    if (ui.needsPublish) {
      toast.message("حتى يشوف الزبون التغيير بالمتجر: اضغط نشر.");
    }

    // Refresh the dashboard page behind Tamima — keep the assistant open.
    refreshBackground({ navigateTo: ui.navigateTo });
  };

  const handleApprove = async () => {
    const isImage = String(action.kind) === "REGENERATE_PRODUCT_IMAGE";
    try {
      if (isImage) {
        toast.message("جارٍ توليد الصورة… قد يطول حوالي دقيقة.");
      }
      // Optimistic: show executing while the long approve request runs.
      onResolved?.({ ...action, status: "EXECUTING" });
      const next = await approve.mutateAsync(action.id);
      if (String(next.status) === "STALE") {
        toast.error(next.error || "تغيّرت البيانات. اطلب اقتراحاً جديداً.");
      } else if (String(next.status) === "FAILED") {
        toast.error(next.error || "فشل تنفيذ الإجراء");
      } else if (String(next.status) === "APPLIED") {
        applySideEffects(next);
      }
      onResolved?.(next);
    } catch (err) {
      onResolved?.(action);
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "تعذر الموافقة على الإجراء",
      );
    }
  };

  const handleReject = async () => {
    try {
      const next = await reject.mutateAsync(action.id);
      toast.message("تم رفض الإجراء — ما صار أي تغيير");
      onResolved?.(next);
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "تعذر رفض الإجراء",
      );
    }
  };

  return (
    <div
      className={cn(
        "mt-2 rounded-2xl border p-3 text-right",
        "border-[#e7edf6] bg-white/80",
        "dark:border-white/8 dark:bg-[#12183b]/70",
        pending && "ring-1 ring-[#00b7ff]/25",
      )}
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">{action.title}</p>
          {action.summary ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {action.summary}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
            pending
              ? "bg-[#00b7ff]/12 text-[#008fc7] dark:text-[#33c5ff]"
              : statusKey === "APPLIED"
                ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
          )}
        >
          {statusLabel}
        </span>
      </div>

      {detailLines.length > 0 ? (
        <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
          {detailLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}

      {pending ? (
        <p className="mt-2 text-[11px] text-[#008fc7] dark:text-[#33c5ff]">
          {String(action.kind) === "REGENERATE_PRODUCT_IMAGE"
            ? "بعد الموافقة يتولّد الصورة (قد يطول حوالي دقيقة) ثم تترفّش الصفحة خلف المساعد."
            : "ما راح يتغيّر شي بالمتجر إلا بعد موافقتك."}
        </p>
      ) : null}
      {statusKey === "EXECUTING" ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#008fc7] dark:text-[#33c5ff]">
          <Loader2 className="size-3 animate-spin" />
          جارٍ التوليد… انتظر حتى يكتمل (ما تسكّر الصفحة).
        </p>
      ) : null}

      {action.error && !pending ? (
        <p className="mt-2 text-xs text-[#ff5252]">{action.error}</p>
      ) : null}

      {pending ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="brand"
            size="sm"
            disabled={busy}
            onClick={handleApprove}
            className="gap-1.5"
          >
            {approve.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            موافقة وتنفيذ
          </Button>
          <Button
            type="button"
            variant="destructive-outline"
            size="sm"
            disabled={busy}
            onClick={handleReject}
            className="gap-1.5"
          >
            {reject.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <X className="size-3.5" />
            )}
            رفض
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default ActionApproval;

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SettingsCard from "./SettingsCard";
import { SettingsInput } from "./SettingsField";
import { pixelsAPI, type StorePixels } from "@/api/endpoints/pixels.endpoints";
import { PlanFeatureUpgrade } from "@/components/plan/PlanFeatureUpgrade";
import { usePlanFeature } from "@/hooks/use-plan-limits";

const NETWORKS: Array<{
  key: keyof StorePixels;
  label: string;
  placeholder: string;
}> = [
  {
    key: "meta",
    label: "Meta (فيسبوك وانستغرام)",
    placeholder: "123456789012345",
  },
  { key: "tiktok", label: "TikTok", placeholder: "C1A2B3C4D5E6F7G8H9I0" },
  {
    key: "snapchat",
    label: "Snapchat",
    placeholder: "0a1b2c3d-1234-4abc-9def-0123456789ab",
  },
];

const pixelsKey = ["store-pixels"] as const;

/**
 * Ad pixels for the storefront (Grow plan). Saving redeploys the published
 * store, so the tags go live without opening the editor.
 */
const StorePixelsSection = () => {
  const allowed = usePlanFeature("social_pixels");
  const { data, isLoading } = useQuery({
    queryKey: pixelsKey,
    queryFn: () => pixelsAPI.fetch(),
    enabled: allowed,
    retry: false,
  });
  return (
    <SettingsCard title="بكسلات الإعلانات">
      {!allowed ? (
        <PlanFeatureUpgrade feature="social_pixels" />
      ) : isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        // Keyed by what was saved, so the form starts from it after each load.
        <PixelsForm
          key={JSON.stringify(data?.pixels ?? {})}
          saved={data?.pixels ?? {}}
        />
      )}
    </SettingsCard>
  );
};

const PixelsForm = ({ saved }: { saved: StorePixels }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<StorePixels>(saved);

  const save = useMutation({
    mutationFn: (pixels: StorePixels) => pixelsAPI.update(pixels),
    onSuccess: (result) => {
      queryClient.setQueryData(pixelsKey, result);
      toast.success(
        result.republishing
          ? "تم حفظ البكسلات، ويجري تحديث متجرك الآن"
          : "تم حفظ البكسلات، وستعمل عند نشر متجرك",
      );
    },
    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(message || "تعذر حفظ البكسلات");
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate({
          meta: form.meta?.trim() ?? "",
          tiktok: form.tiktok?.trim() ?? "",
          snapchat: form.snapchat?.trim() ?? "",
        });
      }}
    >
      <p className="px-1 text-xs leading-relaxed text-slate-500">
        الصق معرّف البكسل من مدير الإعلانات. يُسجَّل كل زائر لمتجرك تلقائياً.
        اترك الحقل فارغاً لإيقافه.
      </p>
      {NETWORKS.map((network) => (
        <label key={network.key} className="block space-y-1.5">
          <span className="px-1 text-sm font-medium text-slate-900 dark:text-slate-100">
            {network.label}
          </span>
          <SettingsInput
            dir="ltr"
            value={form[network.key] ?? ""}
            placeholder={network.placeholder}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                [network.key]: event.target.value,
              }))
            }
          />
        </label>
      ))}
      <Button
        type="submit"
        className="h-11 w-full rounded-[14px]"
        disabled={save.isPending}
      >
        {save.isPending ? <Loader2 className="size-4 animate-spin" /> : "حفظ"}
      </Button>
    </form>
  );
};

export default StorePixelsSection;

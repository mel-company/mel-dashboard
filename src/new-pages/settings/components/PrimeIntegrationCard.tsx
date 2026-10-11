import { ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { usePrimeSetupStatus } from "@/hooks/use-prime-setup-status";

const PRIME_WEBSITE = "https://prime.iq";

/**
 * حساب Prime للمتجر.
 *
 * Status only. The account and shop used to be created from here, with the
 * Prime office hardcoded to `branch: 1`, coordinates falling back to a fixed
 * point in Basra, and the same literal password for every merchant. They are
 * now opened by the server from «موقع الفرع» above — the pin picks the
 * nearest Prime office and the password is random and never leaves the
 * server — so this card only says whether that has happened.
 */
const PrimeIntegrationCard = () => {
  const { data: storeDetails } = useFetchStoreDetails();
  const setupStatus = usePrimeSetupStatus();

  const deliveryCompany = storeDetails?.deliveryCompany;
  const website = deliveryCompany?.website || PRIME_WEBSITE;
  const logo = deliveryCompany?.logo;
  const companyName = deliveryCompany?.name || "Prime";

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {logo ? (
            <img
              src={logo}
              alt={companyName}
              className="size-10 rounded-xl bg-white object-contain p-1"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-sky-700">
              P
            </div>
          )}
          <div className="min-w-0 text-right">
            <p className="text-sm font-semibold text-sky-950">{companyName}</p>
            <p className="text-[11px] leading-snug text-sky-700/80">
              شركة التوصيل المفعّلة لمتجرك
            </p>
          </div>
        </div>

        {setupStatus.isLoading ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-sky-600" />
        ) : setupStatus.isReady ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            <CheckCircle2 className="size-3" />
            جاهز للشحن
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
            <AlertCircle className="size-3" />
            {setupStatus.needsShop ? "يحتاج محل" : "يحتاج حساب"}
          </span>
        )}
      </div>

      {setupStatus.isReady ? (
        <div
          className="rounded-xl bg-white/80 px-3 py-2 text-[11px] text-slate-600"
          dir="ltr"
        >
          <p>merchant: {setupStatus.merchantLoginId}</p>
          <p>senderId: {setupStatus.senderId}</p>
        </div>
      ) : (
        <p className="text-xs leading-relaxed text-sky-800">
          حدّد «موقع الفرع» أعلاه واحفظه — يُفتح حساب Prime ومحلّك تلقائياً
          من الموقع، ويُختار أقرب مكتب لـ Prime إليك.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild>
          <a href={website} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="ml-1 size-3" />
            زيارة موقع Prime
          </a>
        </Button>
      </div>
    </div>
  );
};

export default PrimeIntegrationCard;

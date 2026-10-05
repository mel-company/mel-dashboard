import { useEffect, useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import SettingsCard from "./SettingsCard";
import { SettingsInput } from "./SettingsField";
import { useFindDomainDetails } from "@/api/wrappers/domain.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import {
  useFetchCurrentSettings,
  useFetchStorePaymentMethods,
  useUpdatePaymentMethods,
  useUpsertStorePaymentMethod,
} from "@/api/wrappers/settings.wrappers";
import { useFetchPaymentProviders } from "@/api/wrappers/payment.wrappers";
import { useUpdateStoreDetails } from "@/api/wrappers/settings.wrappers";
import { useFetchStates } from "@/api/wrappers/state.wrappers";
import { useFetchRegions } from "@/api/wrappers/region.wrappers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectDeliveryCompanyDialog from "@/pages/settings/SelectDeliveryCompanyDialog";
import DomainSettingsSection from "./DomainSettingsSection";
import PrimeIntegrationCard from "./PrimeIntegrationCard";
import CourierAccountCard from "./CourierAccountCard";
import { isPrimeDelivery } from "@/api/types/store";
import settingsGearIcon from "@/assets/settings/settings-gear.svg";
import moneyIcon from "@/assets/settings/money.svg";
import qiCardIcon from "@/assets/settings/qi-card.svg";
import chevronIcon from "@/assets/settings/chevron.svg";
import deliveryArrowIcon from "@/assets/settings/delivery-arrow.svg";

type PaymentMethodOption = { id: string; name: string; code?: string };
type CataloguePaymentProvider = {
  code?: string;
  logoUrl?: string | null;
  /** The gateway registry's own branding, when a gateway backs this row. */
  gateway?: { logoUrl?: string | null } | null;
  methods?: PaymentMethodOption[];
};
/** A method with its provider's identity folded in, which is where the mark lives. */
type PaymentMethodRow = PaymentMethodOption & {
  providerCode?: string;
  logoUrl?: string;
};

/**
 * The platform's cash-on-delivery catalogue row — see the server's
 * `payment/cash-on-delivery.ts`, which creates exactly this pair.
 */
const COD_PROVIDER_CODE = "offline";
const COD_METHOD_CODE = "cash_on_delivery";

const SectionGear = () => (
  <div className="flex size-[35px] shrink-0 items-center justify-center rounded-[10px] bg-sky-500/10">
    <img src={settingsGearIcon} alt="" className="size-5" />
  </div>
);

/**
 * The brand mark for a provider row, or nothing.
 *
 * Two server-side sources, in order: the gateway registry's branding — which
 * `payments/gateway.types.ts` says exists precisely so the admin dashboard,
 * this dashboard and the storefront do not each keep a code→logo table, and
 * the third one be the one that is wrong after a rebrand — then whatever an
 * operator typed into «رابط الشعار» on the catalogue row itself.
 *
 * Only an absolute url is taken. A bare storage key has no base to resolve
 * against here, and `<img src="logos/x.png">` would resolve against the
 * current dashboard route and 404 as the page's own HTML.
 */
const providerLogoUrl = (provider: CataloguePaymentProvider) => {
  const url = (provider.gateway?.logoUrl || provider.logoUrl || "").trim();
  return /^(https?:|data:)/i.test(url) ? url : undefined;
};

/**
 * Marks that ship with this build, by provider code.
 *
 * Not a second catalogue — it is what a row falls back to when the url above
 * cannot be loaded or does not exist. Cash on delivery is the second case and
 * always will be: it is not a brand, and no gateway backs it.
 */
const LOCAL_PROVIDER_LOGOS: Record<string, string> = {
  qiservice: qiCardIcon,
  offline: moneyIcon,
};

/**
 * Every row gets a mark.
 *
 * Before this, one did: the icon was chosen by matching the method's Arabic
 * *name* against a Qi-shaped regex, so «زين كاش» — a provider the registry has
 * had a logo for all along — drew a blank 24px gap, and so would every gateway
 * added after it. The name was never the right key; the provider code is.
 *
 * A remote url that fails to load falls through to the local mark and then to
 * a neutral card glyph, because a broken image is worse than a plain one. The
 * `key` on the call site is what resets that after the url changes.
 */
const PaymentMethodLogo = ({
  src,
  providerCode,
}: {
  src?: string;
  providerCode?: string;
}) => {
  const [remoteFailed, setRemoteFailed] = useState(false);
  const local = providerCode ? LOCAL_PROVIDER_LOGOS[providerCode] : undefined;
  const url = !remoteFailed && src ? src : local;

  if (!url) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-6 shrink-0 text-slate-400 dark:text-slate-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="2.5" y="5" width="19" height="14" rx="3" />
        <path d="M2.5 10h19" />
      </svg>
    );
  }

  return (
    <img
      src={url}
      alt=""
      // Rounded because the registry's marks are full-bleed squares — a
      // ZainCash tile with square corners reads as an unstyled image.
      className="size-6 shrink-0 rounded-[6px] object-contain"
      onError={() => setRemoteFailed(true)}
    />
  );
};

const StoreIntegrationsSection = () => {
  const { data: domainDetails } = useFindDomainDetails();
  const { data: storeDetails } = useFetchStoreDetails();
  const { data: currentSettings } = useFetchCurrentSettings();
  const { data: paymentProviders } = useFetchPaymentProviders();
  const { data: storePaymentMethods } = useFetchStorePaymentMethods();

  const updatePaymentMethodsMutation = useUpdatePaymentMethods();
  const upsertMutation = useUpsertStorePaymentMethod();

  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [optimisticCod, setOptimisticCod] = useState<boolean | null>(null);

  /**
   * Where the store ships from.
   *
   * Half of what decides an Iraqi delivery price is whether the parcel leaves
   * the province, and nothing recorded the store's own province — the address
   * was free text. Kept as the platform's province and city rather than a
   * courier's code, so it survives changing courier.
   */
  const updateStoreDetails = useUpdateStoreDetails();
  const [originStateId, setOriginStateId] = useState("");
  const [originRegionId, setOriginRegionId] = useState("");

  const { data: statesData } = useFetchStates();
  const { data: regionsData } = useFetchRegions(originStateId, !!originStateId);

  const asList = (value: unknown): any[] =>
    Array.isArray(value) ? value : ((value as any)?.data ?? []);

  const states = useMemo(() => asList(statesData), [statesData]);
  const regions = useMemo(() => asList(regionsData), [regionsData]);

  useEffect(() => {
    setOriginStateId((storeDetails as any)?.originStateId ?? "");
    setOriginRegionId((storeDetails as any)?.originRegionId ?? "");
  }, [storeDetails]);

  /** Names come back as `{ ar, en }` JSON, or a bare string on older rows. */
  const placeName = (name: unknown): string => {
    if (!name) return "";
    if (typeof name === "string") return name;
    const n = name as Record<string, string | undefined>;
    return n.ar || n.en || n.arabic || n.english || "";
  };

  const saveOrigin = (stateId: string, regionId: string) => {
    updateStoreDetails.mutate(
      { originStateId: stateId || null, originRegionId: regionId || null },
      {
        onSuccess: () => toast.success("تم حفظ موقع الفرع"),
        onError: () => toast.error("فشل حفظ موقع الفرع"),
      },
    );
  };

  /**
   * The catalogue, with cash on delivery lifted out of it.
   *
   * Cash on delivery is two records the server keeps mirrored: the
   * `cash_on_delivery` flag on the store's settings, and a real catalogue
   * method (provider `offline`, method `cash_on_delivery`) so the storefront
   * can list it like any other. Drawing the catalogue verbatim therefore put
   * «الدفع عند الاستلام» on this card twice — the dedicated row below and its
   * own catalogue row — two switches over one piece of state, which read as a
   * contradiction the moment a write landed on one of them first.
   *
   * Matched by code, not by name: a method an admin hand-built under some
   * other code is a different method however it reads in Arabic, and hiding
   * one of those would be worse than repeating a label.
   */
  const { codMethod, paymentMethods } = useMemo(() => {
    const methods: PaymentMethodRow[] = [];
    let cod: PaymentMethodRow | undefined;

    // Two providers can expose the same method id, which rendered duplicate
    // React keys and let one row's toggle drive the other.
    const seen = new Set<string>();
    const providers = asList(paymentProviders) as CataloguePaymentProvider[];
    for (const provider of providers) {
      // Carried onto the method, because the brand is the provider's and a
      // row only ever has the method in hand.
      const logoUrl = providerLogoUrl(provider);
      for (const method of provider?.methods ?? []) {
        if (!method?.id || seen.has(method.id)) continue;
        seen.add(method.id);
        const row: PaymentMethodRow = {
          ...method,
          providerCode: provider.code,
          logoUrl,
        };
        if (
          provider.code === COD_PROVIDER_CODE &&
          method.code === COD_METHOD_CODE
        ) {
          cod = row;
          continue;
        }
        methods.push(row);
      }
    }

    return { codMethod: cod, paymentMethods: methods };
  }, [paymentProviders]);

  /**
   * What this store may do with a method, in one lookup.
   *
   * `available` is the server's own verdict — it applies `canStoreEnable`,
   * the same rule its write path enforces — so a row cannot be drawn as
   * switchable and then refused when the merchant touches it.
   *
   * It matters here because «معطل» is the wrong word for a method the
   * platform has withdrawn: it reads as *the merchant* having switched it
   * off, when they did nothing. «قريبا» says whose decision it was, and the
   * control is disabled so they are not invited to argue with it.
   *
   * No row at all means the method was never configured, which says nothing
   * about availability — so that defaults to switchable, and the server
   * refuses with a readable reason if it disagrees.
   */
  const methodState = (methodId: string) => {
    const storePm = (
      storePaymentMethods as
      | {
          paymentMethodId: string;
          isEnabled: boolean;
          available?: boolean;
          unavailableReason?: string | null;
        }[]
      | undefined
    )?.find((s) => s.paymentMethodId === methodId);

    const available = storePm?.available ?? true;
    return {
      available,
      isEnabled: available && (storePm?.isEnabled ?? false),
      unavailableReason: storePm?.unavailableReason ?? null,
    };
  };

  /**
   * The one cash-on-delivery row, read from both halves of the record.
   *
   * `checked` takes the flag *or* the catalogue row because the server's
   * boot-time reconcile only heals a row to match a `true` flag and never the
   * reverse — so a store that switched cash on through the generic method
   * toggle has a live row and a `false` flag, and showing it off would invite
   * the merchant to "fix" it by toggling twice. The write still goes through
   * the settings endpoint, which sets both.
   *
   * Availability comes from the catalogue row for the same reason every other
   * row here reads it: when the platform has withdrawn the method the switch
   * says «قريبا» and does nothing, rather than saving a flag no checkout can
   * act on.
   */
  const codState = codMethod
    ? methodState(codMethod.id)
    : { available: true, isEnabled: false, unavailableReason: null };

  const cashOnDelivery =
    optimisticCod ?? (currentSettings?.cash_on_delivery || codState.isEnabled);

  const handleCodToggle = (enabled: boolean) => {
    setOptimisticCod(enabled);
    updatePaymentMethodsMutation.mutate(
      { cash_on_delivery: enabled },
      {
        onSuccess: () => {
          toast.success("تم تحديث إعدادات الدفع");
          setOptimisticCod(null);
        },
        onError: () => {
          toast.error("فشل تحديث إعدادات الدفع");
          setOptimisticCod(null);
        },
      },
    );
  };

  const handleMethodToggle = (methodId: string, enabled: boolean) => {
    upsertMutation.mutate(
      { paymentMethodId: methodId, isEnabled: enabled },
      {
        onSuccess: () => toast.success("تم تحديث طريقة الدفع"),
        onError: () => toast.error("فشل تحديث طريقة الدفع"),
      },
    );
  };

  const subdomain = domainDetails?.domain?.trim() || "";

  const deliveryCompany = storeDetails?.deliveryCompany;
  const deliveryCompanyName = deliveryCompany?.name ?? "لم يتم التحديد";

  return (
    <>
      <div className="flex flex-col gap-4">
        <SettingsCard title="نطاق الموقع الالكتروني">
          <button
            type="button"
            className="w-full space-y-2 text-right"
            onClick={() => setDomainDialogOpen(true)}
          >
            <p className="px-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              النطاق
            </p>
            <SettingsInput
              readOnly
              value={subdomain ? `${subdomain}.mel.iq` : "—"}
              dir="ltr"
              className="cursor-pointer text-center"
            />




          </button>
        </SettingsCard>

        <SettingsCard
          title="أعدادات مزودين خدمات الدفع"
          titleAccessory={<SectionGear />}
        >
          <div className="space-y-3">
            <div className="flex h-12 items-center justify-between rounded-[14px] bg-slate-100 px-4 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <PaymentMethodLogo
                  key={codMethod?.logoUrl ?? COD_PROVIDER_CODE}
                  src={codMethod?.logoUrl}
                  providerCode={codMethod?.providerCode ?? COD_PROVIDER_CODE}
                />
                <span
                  className="text-[13px] text-slate-900 dark:text-slate-100"
                  title={codState.unavailableReason ?? undefined}
                >
                  {codMethod?.name ?? "الدفع عند الاستلام"}
                </span>
              </div>
              <Switch
                checked={cashOnDelivery}
                activeLabel="مفعل"
                disabledLabel={codState.available ? "معطل" : "قريبا"}
                onToggle={handleCodToggle}
                disabled={
                  updatePaymentMethodsMutation.isPending || !codState.available
                }
              />
            </div>

            {paymentMethods.map((method: PaymentMethodRow) => {
              const state = methodState(method.id);

              return (
                <div
                  key={method.id}
                  className="flex h-12 items-center justify-between rounded-[14px] bg-slate-100 px-4 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <PaymentMethodLogo
                      key={method.logoUrl ?? method.providerCode ?? method.id}
                      src={method.logoUrl}
                      providerCode={method.providerCode}
                    />
                    <span
                      className="text-[13px] text-slate-900 dark:text-slate-100"
                      title={state.unavailableReason ?? undefined}
                    >
                      {method.name}
                    </span>
                  </div>
                  <Switch
                    checked={state.isEnabled}
                    activeLabel="مفعل"
                    /* «قريبا», not «معطل»: the merchant did not switch this off. */
                    disabledLabel={state.available ? "معطل" : "قريبا"}
                    onToggle={(v) => handleMethodToggle(method.id, v)}
                    disabled={upsertMutation.isPending || !state.available}
                  />
                </div>
              );
            })}
          </div>
        </SettingsCard>

        <SettingsCard
          title="أعدادات مزودين خدمات التوصيل"
          titleAccessory={<SectionGear />}
        >
          <p className="mb-2 px-1 text-sm font-medium text-slate-900 dark:text-slate-100">
            اختيار شركة التوصيل
          </p>
          <button
            type="button"
            className="flex h-12 w-full items-center gap-3 rounded-[14px] bg-slate-100 px-4 text-right dark:bg-slate-900"
            onClick={() => setDeliveryDialogOpen(true)}
          >
            <img
              src={deliveryArrowIcon}
              alt=""
              className="h-6 w-[21px] shrink-0 object-contain"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
              {deliveryCompanyName}
            </span>
            <img src={chevronIcon} alt="" className="size-6 shrink-0" />
          </button>
          <p className="mt-2 px-1 text-[13px] text-slate-500">
            يمكنك تغيير شركة التوصيل كل 30 يوم
          </p>

          <div className="mt-4 space-y-2">
            <p className="px-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              موقع الفرع
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Select
                value={originStateId}
                onValueChange={(value) => {
                  setOriginStateId(value);
                  // The city list follows the province; keeping the previous
                  // selection would save a city in a different province.
                  setOriginRegionId("");
                  saveOrigin(value, "");
                }}
              >
                <SelectTrigger className="h-12 rounded-[14px] bg-slate-100 dark:bg-slate-900">
                  <SelectValue placeholder="المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state: any) => (
                    <SelectItem key={state.id} value={state.id}>
                      {placeName(state.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={originRegionId}
                onValueChange={(value) => {
                  setOriginRegionId(value);
                  saveOrigin(originStateId, value);
                }}
                disabled={!originStateId}
              >
                <SelectTrigger className="h-12 rounded-[14px] bg-slate-100 dark:bg-slate-900">
                  <SelectValue placeholder="المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region: any) => (
                    <SelectItem key={region.id} value={region.id}>
                      {placeName(region.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="px-1 text-[13px] text-slate-500">
              تُستخدم لحساب أجور التوصيل — التوصيل داخل نفس المحافظة يُحسب بسعر
              مختلف.
            </p>
          </div>

          {isPrimeDelivery(storeDetails) ? (
            <div className="mt-3">
              <PrimeIntegrationCard />
            </div>
          ) : null}
        </SettingsCard>

        {/* Whichever courier the store uses: whether it can ship at all, and
            the own-login link for the two vendors that accept one. */}
        <CourierAccountCard />
      </div>

      <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-3xl border-0 p-0 sm:max-w-4xl"
        >
          <DomainSettingsSection onClose={() => setDomainDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <SelectDeliveryCompanyDialog
        open={deliveryDialogOpen}
        onOpenChange={setDeliveryDialogOpen}
        currentDeliveryCompanyId={
          storeDetails?.deliveryCompanyId ?? undefined
        }
      />
    </>
  );
};

export default StoreIntegrationsSection;

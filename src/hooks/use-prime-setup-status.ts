import { useMemo } from "react";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import {
  useCourierAccounts,
  useCourierBranch,
} from "@/api/wrappers/shipping.wrappers";
import {
  getPrimeSenderId,
  hasPrimeAccount,
  isPrimeDelivery,
  isPrimeReadyForShipping,
} from "@/api/types/store";

export type PrimeSetupStepId = "phone" | "location" | "branch" | "zones";

export type PrimeSetupStep = {
  id: PrimeSetupStepId;
  title: string;
  detail: string;
  done: boolean;
  /** Soft steps do not block the merchant alone (ops / platform). */
  blocking: boolean;
  /** What the merchant should press next, when not done. */
  action?: "phone" | "location" | "support";
};

export type PrimeSetupStatus = {
  isLoading: boolean;
  isPrime: boolean;
  /** Branch exists at Prime — parcels can leave. */
  isReady: boolean;
  hasAccount: boolean;
  needsShop: boolean;
  hasPhone: boolean;
  hasLocation: boolean;
  hasBranch: boolean;
  zonesMapped: boolean;
  steps: PrimeSetupStep[];
  /** First incomplete blocking step, or null when ready. */
  nextStep: PrimeSetupStep | null;
  merchantLoginId?: string;
  senderId?: number;
  merchantName?: string;
  active?: boolean;
  displayName: string;
};

function hasStorePhone(phone: unknown): boolean {
  if (typeof phone !== "string") return false;
  return phone.replace(/\D/g, "").length >= 10;
}

/**
 * What a Prime merchant still owes before parcels can leave the shop.
 *
 * The 422s that used to land only after «حفظ موقع الفرع» (no phone, unmapped
 * zones, missing district) are the same absences — listed here so the
 * checklist points at them before save.
 */
export function usePrimeSetupStatus(): PrimeSetupStatus {
  const { data: storeDetails, isLoading: storeLoading } = useFetchStoreDetails();
  const isPrime = isPrimeDelivery(storeDetails);

  const { data: branch, isLoading: branchLoading } = useCourierBranch(isPrime);
  const { data: accountsData, isLoading: accountsLoading } =
    useCourierAccounts(isPrime);

  const primeMerchant = storeDetails?.primeMerchant;
  const hasAccount = hasPrimeAccount(storeDetails);
  const shopReady = isPrimeReadyForShipping(storeDetails);

  const hasPhone = hasStorePhone(storeDetails?.phone);
  const loc = branch?.location;
  const hasLocation = Boolean(
    loc?.latitude != null &&
      loc?.longitude != null &&
      loc?.stateId &&
      loc?.regionId,
  );
  const hasBranch = Boolean(branch?.courier?.hasBranch) || shopReady;

  const primeAccount = accountsData?.accounts?.find(
    (row) => row.courierCode === "prime",
  );
  /** Unknown until accounts load — treat as mapped so we do not scare early. */
  const zonesMapped =
    accountsLoading || !primeAccount ? true : primeAccount.zonesMapped;

  const displayName =
    storeDetails?.deliveryCompany?.name ||
    branch?.courier?.displayName ||
    "Prime";

  const steps = useMemo<PrimeSetupStep[]>(() => {
    return [
      {
        id: "phone",
        title: "رقم هاتف المتجر",
        detail: hasPhone
          ? "رقم الهاتف محفوظ في الإعدادات العامة"
          : "أضفه من «الإعدادات العامة» — الشركة تحتاجه لفتح الفرع",
        done: hasPhone,
        blocking: true,
        action: hasPhone ? undefined : "phone",
      },
      {
        id: "location",
        title: "موقع الفرع على الخريطة",
        detail: hasLocation
          ? "المحافظة والمنطقة والدبوس محفوظة"
          : "اختر المحافظة والمنطقة ثم ثبّت الدبوس على موقع الاستلام",
        done: hasLocation,
        blocking: true,
        action: hasLocation ? undefined : "location",
      },
      {
        id: "branch",
        title: `فتح الفرع لدى ${displayName}`,
        detail: hasBranch
          ? `فرعك مسجّل لدى ${displayName}`
          : "احفظ موقع الفرع لفتحه تلقائياً لدى الشركة",
        done: hasBranch,
        blocking: true,
        action: hasBranch ? undefined : "location",
      },
      {
        id: "zones",
        title: "تغطية منطقتك",
        detail: zonesMapped
          ? "المناطق مربوطة برموز الشركة على المنصة"
          : "إن فشل الحفظ بسبب المناطق، تواصل مع الدعم لربط محافظتك",
        done: zonesMapped,
        blocking: false,
        action: zonesMapped ? undefined : "support",
      },
    ];
  }, [hasPhone, hasLocation, hasBranch, zonesMapped, displayName]);

  const nextStep = steps.find((step) => step.blocking && !step.done) ?? null;

  return {
    isLoading: storeLoading || (isPrime && (branchLoading || accountsLoading)),
    isPrime,
    isReady: hasBranch,
    hasAccount,
    needsShop: hasAccount && !hasBranch,
    hasPhone,
    hasLocation,
    hasBranch,
    zonesMapped,
    steps,
    nextStep,
    merchantLoginId: primeMerchant?.merchantLoginId,
    senderId: getPrimeSenderId(storeDetails),
    merchantName: primeMerchant?.name,
    active: primeMerchant?.active,
    displayName,
  };
}

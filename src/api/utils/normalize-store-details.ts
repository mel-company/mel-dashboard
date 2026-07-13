import type {
  DeliveryCompanySummary,
  DeliverySettingsSummary,
  PrimeMerchantSummary,
  StoreDetails,
} from "@/api/types/store";

function mapDeliveryCompany(
  raw: Record<string, unknown> | null | undefined,
): DeliveryCompanySummary | null {
  if (!raw) return null;
  return {
    id: String(raw.id ?? ""),
    code: raw.code as string | undefined,
    name: raw.name as string | undefined,
    description: raw.description as string | undefined,
    logo: (raw.logo as string | null | undefined) ?? null,
    website: (raw.website as string | null | undefined) ?? null,
    phone: (raw.phone as string | null | undefined) ?? null,
    email: (raw.email as string | null | undefined) ?? null,
  };
}

function mapDeliverySettings(
  raw: Record<string, unknown> | null | undefined,
): DeliverySettingsSummary | null {
  if (!raw) return null;
  return {
    canChangeDeliveryCompany: raw.can_change_delivery_company as
      | boolean
      | undefined,
    deliveryCompanyLastUpdate:
      (raw.delivery_company_last_update as string | null | undefined) ?? null,
    deliveryNotes: raw.delivery_notes as string | undefined,
    estimatedDeliveryDays: raw.estimated_delivery_days as number | undefined,
    enableShippingProviders: raw.enable_shipping_providers as
      | boolean
      | undefined,
    localPickup: raw.local_pickup as boolean | undefined,
  };
}

function mapPrimeMerchant(
  raw: Record<string, unknown> | null | undefined,
): PrimeMerchantSummary | null {
  if (!raw) return null;
  return {
    merchantLoginId:
      (raw.merchantLoginId as string | undefined) ||
      (raw.merchant_login_id as string | undefined),
    senderId:
      (raw.senderId as number | undefined) ||
      (raw.sender_id as number | undefined),
    active: raw.active as boolean | undefined,
    name: raw.name as string | undefined,
  };
}

export function normalizeStoreDetails(raw: Record<string, unknown>): StoreDetails {
  const deliveryCompany =
    mapDeliveryCompany(
      (raw.delivery_company ?? raw.deliveryCompany) as
        | Record<string, unknown>
        | undefined,
    ) ?? undefined;

  const deliverySettings =
    mapDeliverySettings(
      (raw.delivery_settings ?? raw.deliverySettings) as
        | Record<string, unknown>
        | undefined,
    ) ?? undefined;

  const primeMerchant =
    mapPrimeMerchant(
      (raw.prime_merchant ?? raw.primeMerchant) as
        | Record<string, unknown>
        | null
        | undefined,
    ) ?? undefined;

  const deliveryCompanyId =
    (raw.deliveryCompanyId as string | null | undefined) ??
    deliveryCompany?.id ??
    null;

  const primeLoginId =
    (raw.prime_login_id as string | null | undefined) ??
    (raw.primeLoginId as string | null | undefined) ??
    null;

  const legacySettings = (raw.settings as StoreDetails["settings"]) ?? {};

  return {
    ...raw,
    deliveryCompanyId,
    deliveryCompany,
    deliverySettings,
    primeLoginId,
    primeMerchant,
    settings: {
      ...legacySettings,
      delivery_company_last_update:
        deliverySettings?.deliveryCompanyLastUpdate ??
        legacySettings.delivery_company_last_update ??
        null,
    },
  };
}

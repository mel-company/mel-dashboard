export type DeliveryCompanySummary = {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  logo?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type DeliverySettingsSummary = {
  canChangeDeliveryCompany?: boolean;
  deliveryCompanyLastUpdate?: string | null;
  deliveryNotes?: string;
  estimatedDeliveryDays?: number;
  enableShippingProviders?: boolean;
  localPickup?: boolean;
};

export type PrimeMerchantSummary = {
  merchantLoginId?: string;
  senderId?: number;
  active?: boolean;
  name?: string;
};

export type StoreDetails = {
  id?: string;
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  location?: string;
  logo?: string;
  baseUrl?: string;
  base_url?: string;
  deliveryCompanyId?: string | null;
  deliveryCompany?: DeliveryCompanySummary | null;
  deliverySettings?: DeliverySettingsSummary | null;
  /** معرّف Prime المحجوز من الباكند — للعرض فقط */
  primeLoginId?: string | null;
  primeMerchant?: PrimeMerchantSummary | null;
  settings?: {
    delivery_company_last_update?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export function isPrimeDelivery(
  storeDetails?: Pick<StoreDetails, "deliveryCompany"> | null,
): boolean {
  return storeDetails?.deliveryCompany?.code === "prime";
}

export function hasPrimeAccount(
  storeDetails?: Pick<StoreDetails, "primeMerchant"> | null,
): boolean {
  return !!storeDetails?.primeMerchant?.merchantLoginId;
}

export function isPrimeReadyForShipping(
  storeDetails?: Pick<StoreDetails, "primeMerchant"> | null,
): boolean {
  const merchant = storeDetails?.primeMerchant;
  return !!merchant?.merchantLoginId && !!merchant?.senderId;
}

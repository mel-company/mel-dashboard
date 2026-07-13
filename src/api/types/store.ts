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

export type PrimeMerchantShop = {
  id: number;
  name?: string;
  phone1?: string;
  active?: boolean;
};

export type PrimeMerchantSummary = {
  merchantLoginId?: string;
  merchantId?: number;
  senderId?: number;
  active?: boolean;
  name?: string;
  state?: string;
  district?: number;
  branch?: number;
  hasShop?: boolean;
  shops?: PrimeMerchantShop[];
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
  if (!merchant?.merchantLoginId) return false;
  return !!(merchant.senderId && merchant.senderId > 0) || !!merchant.hasShop;
}

export function getPrimeSenderId(
  storeDetails?: Pick<StoreDetails, "primeMerchant"> | null,
): number | undefined {
  const merchant = storeDetails?.primeMerchant;
  const id = merchant?.senderId ?? merchant?.shops?.[0]?.id;
  return id && id > 0 ? id : undefined;
}

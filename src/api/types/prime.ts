export type PrimeState = {
  code: string;
  name?: string;
};

export type PrimeDistrict = {
  id: number;
  name?: string;
};

export type PrimeBranch = {
  id: number;
  name?: string;
};

export type CreatePrimeMerchantInput = {
  name: string;
  loginId?: string;
  password: string;
  phone1: string;
  email?: string;
  state: string;
  district: number;
  addressDetails: string;
  latitude?: string;
  longtitude?: string;
  branch: number;
  storeId?: string;
};

export type CreatePrimeShopInput = {
  name: string;
  phone1: string;
};

export type CalculatePrimeChargesInput = {
  state: string;
  district: number;
  receiptAmtIqd?: number;
  senderId?: number;
  receiverName?: string;
  receiverHp1?: string;
  locationDetails?: string;
  productInfo?: string;
  qty?: number;
};

export type CreatePrimeShipmentInput = {
  senderSystemCaseIdWithCharacters: string;
  senderId: number;
  receiverName: string;
  receiverHp1: string;
  locationDetails: string;
  state: string;
  district: number;
  receiptAmtIqd: number;
  productInfo: string;
  qty: number;
  orderId?: string;
};

export type PrimeTestConfig = {
  merchantLoginId?: string;
  senderId?: number;
};

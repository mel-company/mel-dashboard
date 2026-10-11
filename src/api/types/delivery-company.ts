/**
 * شركة التوصيل المتاحة للمتجر.
 *
 * Only the fields the dashboard draws. The route carries far more — regions,
 * states, a store count, a monthly order count — all of it for the admin
 * dashboard's table, none of it for a merchant choosing who carries their
 * parcels.
 *
 * No `status`: the list is already filtered to the active companies, so a
 * component holding one of these has nothing left to decide about it.
 */
export type DeliveryCompany = {
  id: string;
  name?: string;
  description?: string;
  code?: string;
  /** Absolute, on the platform CDN. Prime has none, so it is optional. */
  logo?: string | null;
};

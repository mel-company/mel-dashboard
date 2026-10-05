/**
 * شركة التوصيل المتاحة للمتجر.
 *
 * Only the fields the dashboard draws. The route carries far more — regions,
 * states, a store count, a monthly order count — all of it for the admin
 * dashboard's table, none of it for a merchant choosing who carries their
 * parcels.
 */
export type DeliveryCompany = {
  id: string;
  name?: string;
  description?: string;
  code?: string;
};

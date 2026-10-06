import axiosInstance from "@/utils/AxiosInstance";
import type {
  ActiveCourier,
  CourierAccountSummary,
  CourierShipment,
  CourierTrackingEvent,
  CreateShipmentInput,
} from "@/api/types/shipping";

/**
 * الشحن عبر أي شركة — مسار واحد لكل الشركات.
 *
 * Replaces reaching for `/prime/*` to dispatch. Those vendor routes still
 * exist and are still the right thing for vendor-shaped jobs — invoices,
 * pick-up locations, reproducing a problem against exact fields — but an
 * ordinary dispatch goes through here, where the server picks the adapter off
 * the store's chosen company.
 *
 * Every call below is scoped to the signed-in store on the server, so none of
 * them takes a store id.
 */
export const shippingAPI = {
  /**
   * شركة الشحن الخاصة بهذا المتجر وما تدعمه.
   *
   * Not `GET /shipping/couriers`, which lists all four: a dashboard built on
   * that would offer a Cancel button that fails for Al-Waseet and a Label
   * button that fails for Modon and Al-Waseet.
   */
  getActiveCourier: async (): Promise<ActiveCourier> => {
    const { data } = await axiosInstance.get<ActiveCourier>(
      "/shipping/couriers/active",
    );
    return data;
  },

  /** الطرد المسجَّل لهذا الطلب، أو null إن لم يُشحن بعد. */
  getShipment: async (orderId: string): Promise<CourierShipment | null> => {
    const { data } = await axiosInstance.get<CourierShipment | null>(
      `/shipping/orders/${orderId}/shipment`,
    );
    return data;
  },

  /**
   * تسجيل الطرد لدى شركة الشحن.
   *
   * An act, never a side effect: it costs the merchant money and cannot be
   * undone once a driver holds the parcel, which is why no order status
   * triggers it.
   */
  createShipment: async (
    orderId: string,
    body: CreateShipmentInput = {},
  ): Promise<CourierShipment> => {
    const { data } = await axiosInstance.post<CourierShipment>(
      `/shipping/orders/${orderId}/shipment`,
      body,
    );
    return data;
  },

  /** سؤال الشركة عن حالة الطرد وتسجيل الجواب. */
  syncShipment: async (orderId: string): Promise<CourierShipment> => {
    const { data } = await axiosInstance.post<CourierShipment>(
      `/shipping/orders/${orderId}/shipment/sync`,
      {},
    );
    return data;
  },

  /**
   * مسار الطرد، حيث تحتفظ الشركة به.
   *
   * Boxy is the only one of the four that keeps a real timeline; the others
   * return at most their current status as a single event.
   */
  trackShipment: async (orderId: string): Promise<CourierTrackingEvent[]> => {
    const { data } = await axiosInstance.get<CourierTrackingEvent[]>(
      `/shipping/orders/${orderId}/shipment/tracking`,
    );
    return data;
  },

  /** ملصق أو وصل قابل للطباعة. */
  getLabel: async (
    orderId: string,
    size?: string,
  ): Promise<{ labelUrl: string }> => {
    const { data } = await axiosInstance.get<{ labelUrl: string }>(
      `/shipping/orders/${orderId}/shipment/label`,
      { params: size ? { size } : undefined },
    );
    return data;
  },

  /**
   * سحب الطرد.
   *
   * Every courier refuses once a driver has it, and the refusal carries the
   * courier's own reason — which is more useful than anything this dashboard
   * could decide in advance, so it does not try.
   */
  cancelShipment: async (orderId: string): Promise<CourierShipment> => {
    const { data } = await axiosInstance.delete<CourierShipment>(
      `/shipping/orders/${orderId}/shipment`,
    );
    return data;
  },

  /**
   * هوية هذا المتجر لدى كل شركة وما ينقصها. لا يعيد كلمة المرور أبدًا.
   *
   * Every registered courier, not only the ones this store has a row for —
   * so a screen can say which companies are ready to ship *before* a merchant
   * picks one of them.
   */
  getAccounts: async (): Promise<{
    canStoreCredentials: boolean;
    accounts: CourierAccountSummary[];
  }> => {
    const { data } = await axiosInstance.get<{
      canStoreCredentials: boolean;
      accounts: CourierAccountSummary[];
    }>("/shipping/couriers/accounts");
    return data;
  },

  /**
   * حساب التاجر الخاص لدى الشركة.
   *
   * Only Modon Express and Al-Waseet take one: neither publishes a
   * sub-account endpoint, so a merchant who wants parcels filed under their
   * own name supplies the login they already hold. Encrypted at rest, and
   * refused outright when the server has no encryption key rather than being
   * stored in the clear.
   */
  setCredentials: async (
    code: string,
    body: { username: string; password: string },
  ): Promise<CourierAccountView> => {
    const { data } = await axiosInstance.put<CourierAccountView>(
      `/shipping/couriers/${code}/credentials`,
      body,
    );
    return data;
  },

  /** نسيان الحساب الخاص والعودة إلى حساب المنصة. */
  clearCredentials: async (code: string): Promise<CourierAccountView | null> => {
    const { data } = await axiosInstance.delete<CourierAccountView | null>(
      `/shipping/couriers/${code}/credentials`,
    );
    return data;
  },
};

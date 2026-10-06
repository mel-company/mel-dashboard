/**
 * الشحن — بمفردات المنصة، لا بمفردات أي شركة.
 *
 * Every courier has its own words for a parcel: Prime calls it a case, Modon
 * an order with a `qr_id`, Boxy a ULID. None of that reaches this dashboard —
 * the server's adapter layer translates, and these are the translated terms.
 *
 * The practical consequence for the UI: nothing here is conditional on which
 * company a store uses, **except** through `capabilities`. Three of the four
 * couriers cannot quote a price before dispatch, two cannot produce a label
 * and one cannot cancel, so a screen that offers every button to every
 * courier shows a merchant a Cancel that returns 422 — which reads as a
 * broken dashboard rather than a courier limitation.
 */

export type CourierShipmentStatus =
  | "CREATED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED"
  | "FAILED"
  | "UNKNOWN";

export interface CourierCapabilities {
  quote: boolean;
  createShipment: boolean;
  getShipment: boolean;
  track: boolean;
  cancelShipment: boolean;
  label: boolean;
  zoneCatalogue: boolean;
  webhook: boolean;
}

/**
 * The store's own courier — `GET /shipping/couriers/active`.
 *
 * Deliberately not the catalogue of all four: a dashboard drawing buttons for
 * one store needs that store's capabilities, not the union of everyone's.
 *
 * Answers rather than throws when there is no courier, because "this store
 * cannot ship yet" is a state to render.
 */
export type ActiveCourier =
  | { selected: false; reason: string }
  | {
      selected: true;
      integrated: false;
      deliveryCompanyId: string;
      deliveryCompanyName: string;
      code: string;
      reason: string;
    }
  | {
      selected: true;
      integrated: true;
      deliveryCompanyId: string;
      deliveryCompanyName: string;
      code: string;
      displayName: string;
      capabilities: CourierCapabilities;
      /** Everything the courier requires of this store is recorded. */
      accountReady: boolean;
      /** Which branch fields an operator still has to provision. */
      accountMissing: string[];
      /**
       * Whether the courier can create a sub-account for this store at all.
       *
       * False for Modon Express and Al-Waseet, which publish no sub-account
       * endpoint. It is what tells a merchant that an incomplete setup is not
       * something an operator is about to finish — there is nothing to wait
       * for, and linking their own courier login is the whole of it.
       */
      supportsBranches: boolean;
      /** Whether this courier accepts the merchant's own login at all. */
      acceptsMerchantCredentials: boolean;
      /** Whether the merchant has supplied one. Never the credential. */
      usingMerchantCredentials: boolean;
      /**
       * Whether this deployment can store a credential at all.
       *
       * False when the server has no encryption key. Storing is refused in
       * that case rather than written in the clear, which is right — but it
       * means the form has to be closed *before* a merchant types a password,
       * not after, since the refusal names an environment variable they
       * cannot act on.
       */
      canStoreCredentials: boolean;
    };

/** One parcel, as the platform records it. */
export interface CourierShipment {
  id: string;
  orderId: string;
  deliveryCompanyId: string | null;
  courierCode: string;
  /** The courier's own id, as text — four couriers, four id schemes. */
  externalId: string | null;
  /** The MEL code the courier was asked to echo back. */
  reference: string | null;
  status: CourierShipmentStatus;
  /** The courier's own words, in its own language. */
  rawStatus: string | null;
  rawStatusCode: string | null;
  /**
   * What the courier is charging the merchant.
   *
   * Not the same number as the order's delivery fee, which is what the
   * shopper paid and was decided before the courier was asked. The gap is the
   * merchant's to absorb, so it has to be visible rather than inferred.
   */
  courierFee: number | null;
  labelUrl: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourierTrackingEvent {
  status: CourierShipmentStatus;
  rawStatus: string | null;
  rawStatusCode: string | null;
  occurredAt: string | null;
  note: string | null;
}

/**
 * The extras one courier needs and the others do not.
 *
 * Everything else about the parcel is read off the order on the server, so
 * this is the whole of what a dispatch form collects.
 */
export interface CreateShipmentOptions {
  /** Prime: the shop id. Normally read off the store's registered branch. */
  senderId?: number;
  /** Modon / Al-Waseet. */
  packageSize?: number;
  replacement?: boolean;
  /** Boxy. */
  size?: "S" | "M" | "L";
  isFragile?: boolean;
  pickUpType?: "PICK_UP" | "DROP_OFF";
  pickUpAddressUid?: string;
  readyToPickUp?: boolean;
}

export interface CreateShipmentInput {
  options?: CreateShipmentOptions;
  /**
   * Replace a recorded parcel.
   *
   * The old parcel still exists at the courier and becomes unreachable from
   * the platform, because one order holds one record — so cancel first
   * wherever the courier allows it.
   */
  force?: boolean;
}

/** This store's identity at each courier, for a settings page. */
export interface CourierAccountView {
  courierCode: string;
  active: boolean;
  merchantLoginId: string | null;
  senderId: number | null;
  pickUpAddressUid: string | null;
  username: string | null;
  /** Whether a password is stored. Never the password itself. */
  hasPassword: boolean;
  updatedAt: string | null;
}

/**
 * ما يحتاجه كل شركة من هذا المتجر، وما سُجِّل منه — `GET
 * /shipping/couriers/accounts`.
 *
 * One entry per **registered courier**, including the ones this store has no
 * account row for, which is the point: a store nobody has provisioned at Boxy
 * has nothing stored, and an empty list reads as "nothing to worry about"
 * rather than "cannot ship". The picker needs the answer for the companies a
 * merchant has *not* chosen, before they choose one.
 */
export interface CourierAccountSummary {
  courierCode: string;
  displayName: string;
  /**
   * Whether the vendor can create a sub-account for a store at all. False for
   * Modon Express and Al-Waseet, which publish no such endpoint — so there is
   * nothing for an operator to provision and nothing to wait for.
   */
  supportsBranches: boolean;
  /** Whether it accepts the merchant's own login instead. */
  acceptsMerchantCredentials: boolean;
  /** Whether this deployment can store a merchant credential at all. */
  canStoreCredentials: boolean;
  /** Branch fields this courier refuses to dispatch without. */
  requiredBranchFields: string[];
  /** Branch fields it reads but does not insist on. */
  optionalBranchFields: string[];
  /** The required fields this store is missing. Empty when ready. */
  accountMissing: string[];
  /** Whether this store can ship with this courier today. */
  accountReady: boolean;
  /** Null when this store has never been provisioned at this courier. */
  account: CourierAccountView | null;
}

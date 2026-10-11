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

/**
 * The statuses that end a parcel's journey.
 *
 * Mirrors the server's `PARCEL_TERMINAL_STATUSES`, which is the single list
 * both its webhook staleness guard and its order-cancel guard ask. `FAILED` is
 * deliberately absent from both: a failed delivery attempt is retried, so a
 * driver may still be carrying the box.
 *
 * One copy here, for the same reason there is one copy there — this list was
 * written out twice in the order pages, once to decide whether to offer «سحب
 * الطرد» and once to decide whether cancelling the order needs a warning, and
 * the two would have to be edited together to stay honest.
 */
export const PARCEL_TERMINAL_STATUSES: CourierShipmentStatus[] = [
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
];

/** A courier may still be carrying this parcel. */
export const isParcelLive = (parcel: {
  externalId: string | null;
  status: CourierShipmentStatus;
}): boolean =>
  !!parcel.externalId && !PARCEL_TERMINAL_STATUSES.includes(parcel.status);

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
      /** Whether the platform still offers this company. */
      companyActive: boolean;
      reason: string;
    }
  | {
      selected: true;
      integrated: true;
      deliveryCompanyId: string;
      deliveryCompanyName: string;
      code: string;
      displayName: string;
      /**
       * Whether the platform still offers this company at all.
       *
       * False means an operator withdrew it while this store was using it.
       * Parcels keep moving — `INACTIVE` stops a company being *offered*, not
       * being used, because making it stop carrying would break every store on
       * it the instant the switch flipped. But the merchant has to be told,
       * and nothing told them: this route did not read `status`, the dispatch
       * path does not either, and store details carry no such field, so a
       * withdrawn courier looked completely ordinary while quietly being
       * something they could no longer re-select.
       */
      companyActive: boolean;
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
  /**
   * The company actually holding **this parcel**, and what it supports.
   *
   * Not necessarily the store's current courier, and that is the point: every
   * server path acts on the parcel's own `courierCode`, so a merchant who
   * switches company leaves live parcels behind with the old one. Gating a
   * parcel's buttons on `ActiveCourier.capabilities` therefore described a
   * different courier than the one the button would reach — a Cancel that
   * 422s on an Al-Waseet parcel, or no Cancel at all for a Boxy parcel once
   * the store moved to Al-Waseet.
   *
   * Null when nothing implements the code the parcel was created under: an
   * integration removed while its parcels were still in the air. The ids and
   * the last known status are still worth showing, because they are what a
   * merchant phones the courier with.
   */
  courier: {
    code: string;
    displayName: string;
    capabilities: CourierCapabilities;
  } | null;
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
  readyToPickUp?: boolean;
  /**
   * No `pickUpAddressUid`, and it is not an omission.
   *
   * It names a branch inside the platform's account rather than anything about
   * this parcel — it is the address a driver collects from — so the server
   * refuses to accept it here and only an operator can record it, per store.
   * `GET /boxy/pick-up-locations` is store-user guarded and lists every
   * merchant's warehouse, so a dispatch that took this field would let any
   * merchant send a van to another merchant's shop.
   *
   * It was declared here anyway, and the server's global pipe runs
   * `whitelist: true` — so anything wired to it would have been stripped in
   * silence, with no 400 and nothing in a log, and the parcel would ship from
   * the default location looking like it had worked.
   */
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
  /**
   * The courier's own sentence about how a store is registered with it, in
   * Arabic — what Prime's `create-merchant-shop` produces, or that Modon
   * publishes no sub-account endpoint at all.
   *
   * Served since the route existed and rendered by nothing, which left the
   * dashboard restating the same thing in its own words and the two free to
   * drift. It is the reason behind `supportsBranches`, so it belongs wherever
   * that flag changes what a merchant is told.
   */
  branchNoteAr: string;
  /** The required fields this store is missing. Empty when ready. */
  accountMissing: string[];
  /** Whether this store can ship with this courier today. */
  accountReady: boolean;
  /**
   * Whether this courier can address a parcel to anywhere at all.
   *
   * False when nobody has mapped a province to its code: it then prices every
   * destination at the fallback fee and refuses every dispatch. A property of
   * the courier rather than of this store, so it is separate from
   * `accountReady` — a company can want nothing from a merchant and still be
   * unable to deliver. Both have to be asked before the picker offers it,
   * because the choice is held for 30 days.
   */
  zonesMapped: boolean;
  /** Null when this store has never been provisioned at this courier. */
  account: CourierAccountView | null;
}

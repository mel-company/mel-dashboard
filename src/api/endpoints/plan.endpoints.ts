import axiosInstance from "@/utils/AxiosInstance";

export type PlusFeature =
  | "ai_editor"
  | "tamima"
  | "mobile_app"
  | "team_users"
  | "pos";

export type PlanEntitlements = {
  max_users: number;
  ai_store_credits: number;
  ai_editor_credits: number;
  ai_tamima_credits: number;
  has_mobile_app: boolean;
  has_ai_editor: boolean;
  has_tamima: boolean;
};

export type LockedFeature = {
  feature: PlusFeature;
  requiredPlan: string;
  message: string;
};

/** What a plan caps. `monthlyOrders` never blocks checkout; past it the merchant is only asked to upgrade. */
export type LimitedResource =
  | "products"
  | "categories"
  | "categoryGroups"
  | "coupons"
  | "monthlyOrders";

/** One cap with this store's usage. `limit: null` is unlimited. */
export type PlanLimitUsage = {
  limit: number | null;
  used: number;
  reached: boolean;
};

/** Grow-only features, as the store may use them right now. */
export type PlanFeatureKey = "social_pixels" | "custom_domain";

/** Post-term track from `GET /plan/entitlements`. */
export type SubscriptionLifecyclePhase =
  | "ACTIVE"
  | "VIEW_ONLY"
  | "FROZEN"
  | "PURGE_DUE";

export type PlanEntitlementsResponse = {
  subscription: {
    id: string;
    status: string;
    start_at: string;
    end_at: string;
    /** Whether the term covers today. */
    inForce?: boolean;
    /**
     * ACTIVE | VIEW_ONLY (≤7 days past end) | FROZEN (7..90) | PURGE_DUE (90+).
     */
    lifecyclePhase?: SubscriptionLifecyclePhase;
    /** Whole days until `end_at`, rounded up; 0 once it has passed. */
    daysLeft?: number;
    /** Seven days or fewer left: the dashboard shows its renewal bar. */
    expiringSoon?: boolean;
    /** Ended: order details are closed until the merchant renews. */
    expired?: boolean;
    promo_free_claimed?: boolean;
    promo_discount_months_used?: number;
  };
  plan: {
    id: string;
    code: string;
    name: string;
    monthly_price?: number;
    yearly_price?: number;
  };
  entitlements: PlanEntitlements;
  /** Absent on a server older than the Basic/Grow plans. */
  limits?: Record<LimitedResource, PlanLimitUsage>;
  features?: Record<PlanFeatureKey, boolean>;
  /** One-time trial sizes: AI store builds, editor-agent, and Tamima. */
  trials?: { aiStore: number; aiEditor: number; aiTamima?: number };
  locked: LockedFeature[];
  upgradeAvailable: boolean;
  upgradeTo: { planId?: string | null; planCode: string; planName: string } | null;
};

/** The 403 a create gets at a plan cap. */
export type PlanLimitErrorBody = {
  statusCode: 403;
  code: "PLAN_LIMIT_REACHED";
  resource: LimitedResource;
  limit: number;
  used: number;
  requiredPlan: string;
  requiredPlanName: string;
  message: string;
};

export type PlanUpgradeErrorBody = {
  statusCode: 403;
  code: "PLAN_UPGRADE_REQUIRED";
  feature: PlusFeature;
  requiredPlan: string;
  requiredPlanName: string;
  message: string;
  upgrade: {
    planCode: string;
    planName: string;
    reason: PlusFeature;
  };
};

export const planAPI = {
  /**
   * Get all plans with optional filtering and pagination
   */
  fetchAll: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/plan/store-plans", {
      params: {
        ...(params?.page && { page: params.page }),
        ...(params?.limit && { limit: params.limit }),
      },
    });
    return data;
  },

  /**
   * Get a single plan by ID
   */
  fetchOne: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get<any>(`/plan/${id}`);
    return data;
  },

  /**
   * Current store entitlements + locked PLUS features (for upgrade UI).
   * GET /plan/entitlements
   */
  fetchEntitlements: async (): Promise<PlanEntitlementsResponse> => {
    const { data } = await axiosInstance.get<PlanEntitlementsResponse>(
      "/plan/entitlements",
    );
    return data;
  },

  /**
   * Whether this store may use the POS surface right now.
   *
   * `GET /plan/pos-access` exists for exactly this — its own Swagger summary
   * says "call on dash /pos mount" — and nothing called it, so the POS page
   * gated only on the «متجر فعلي» store setting and a GO merchant could open
   * it. Answers `{ allowed: true }` or throws a 403 carrying
   * `PLAN_UPGRADE_REQUIRED`.
   *
   * Asked of the server rather than derived from the plan columns here, because
   * the answer depends on whether the *term* is in force, which no client can
   * see.
   */
  posAccess: async (): Promise<{ allowed: boolean; feature?: string }> => {
    const { data } = await axiosInstance.get<{
      allowed: boolean;
      feature?: string;
    }>("/plan/pos-access");
    return data;
  },
};

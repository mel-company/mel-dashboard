import axiosInstance from "@/utils/AxiosInstance";

export type PlusFeature = "ai_editor" | "mobile_app" | "team_users";

export type PlanEntitlements = {
  max_users: number;
  ai_store_credits: number;
  ai_editor_credits: number;
  has_mobile_app: boolean;
  has_ai_editor: boolean;
};

export type LockedFeature = {
  feature: PlusFeature;
  requiredPlan: string;
  message: string;
};

export type PlanEntitlementsResponse = {
  subscription: {
    id: string;
    status: string;
    start_at: string;
    end_at: string;
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
  locked: LockedFeature[];
  upgradeAvailable: boolean;
  upgradeTo: { planCode: string; planName: string } | null;
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

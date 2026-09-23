import axiosInstance from "@/utils/AxiosInstance";

/** One of the store's finished AI-generated designs. */
export interface StoreDesign {
  id: string;
  /** Brand name the design was generated around, when it has one. */
  storeName: string | null;
  tagline: string | null;
  /** The design's palette, for a card that has no screenshot yet. */
  theme: { primary?: string; secondary?: string; [key: string]: unknown } | null;
  /** What the merchant originally asked for. */
  prompt: string;
  templateId: string | null;
  createdAt: string;
  /** Whether this is the design the storefront is currently serving. */
  isActive: boolean;
  /** Signed R2 URL of the captured screenshot, or null if none exists yet. */
  thumbnail: string | null;
  /**
   * Public, browsable demo of this design.
   *
   * Renders an invented catalogue and makes no API call, so the link is safe
   * to open anywhere and safe to send to anyone.
   */
  demoUrl: string;
}

/** What `POST /publish/apply-generation` answers with. */
export interface ApplyDesignResponse {
  success: boolean;
  /** Where it got to: "preview" and "deploy" are failures, "done" is not. */
  stage?: "preview" | "deploy" | "done";
  generationId?: string;
  subdomain?: string;
  /** The live storefront address, present on success. */
  url?: string;
  message?: string;
  error?: string;
}

export const designAPI = {
  /** The store's finished AI-generated designs, newest first. */
  list: async (): Promise<StoreDesign[]> => {
    const { data } = await axiosInstance.get<{ data: StoreDesign[] }>(
      "/ai-agent/store-generator/store/designs",
    );
    return data?.data ?? [];
  },

  /**
   * Publish one of those designs.
   *
   * The server replaces the store's pages and brand, updates the editor draft
   * and redeploys the Cloudflare Worker inline — so this blocks for around a
   * minute and needs a timeout well past the instance-wide 10s default.
   *
   * It answers 200 even when it fails, reporting `success: false` and the
   * `stage` it stopped at, so callers must read the body, not the status.
   */
  apply: async (generationId: string): Promise<ApplyDesignResponse> => {
    const { data } = await axiosInstance.post<ApplyDesignResponse>(
      "/publish/apply-generation",
      { generationId },
      { timeout: 180_000 },
    );
    return data;
  },
};

/**
 * Where to actually open a design's demo from this dashboard.
 *
 * The server returns the API's own public address, which is right for a link
 * being sent to someone and wrong for a developer on localhost — there
 * `API_BASE_URL` is unset, so it falls back to the production host, and that
 * host does not have this build. It cannot simply be pointed at localhost
 * either: the deployer hands the same value to every storefront it ships.
 *
 * On localhost the path is taken same-origin instead, which Vite proxies to
 * the local API. In production the dashboard is served same-origin with the
 * API anyway, so both resolve to the same place.
 */
export function resolveDemoUrl(design: Pick<StoreDesign, "id" | "demoUrl">): string {
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(
    window.location.hostname,
  );
  if (!isLocal) return design.demoUrl;
  return new URL(
    `/api/v1/publish/demo/${design.id}`,
    window.location.origin,
  ).href;
}

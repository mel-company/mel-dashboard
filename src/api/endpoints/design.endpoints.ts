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
   * Public, browsable preview of this design, on a hostname of its own:
   * `https://<id>-demo-store.<root>`.
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
 * Where to actually open a design's preview from this dashboard.
 *
 * The server returns `https://<id>-demo-store.mel.iq` — a hostname per design,
 * which is the point: this is the one link a merchant hands to someone outside
 * the platform, it should not be a path on the API, and at its own root the
 * storefront's in-app routes are real paths that survive a reload.
 *
 * That address is right for sharing and wrong for a developer on localhost,
 * where no such hostname resolves to this build. On localhost the API route is
 * taken same-origin instead, which Vite proxies to the local API — the Worker
 * is a proxy onto exactly that route, so the two render the same page. Only
 * the asset base differs, and the server picks it per host.
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

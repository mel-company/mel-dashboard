import axiosInstance from "@/utils/AxiosInstance";

/** Social ad pixels the storefront loads (Grow plan). */
export type StorePixels = {
  meta?: string;
  tiktok?: string;
  snapchat?: string;
};

export type StorePixelsResponse = {
  pixels: StorePixels;
  /** Whether the store's plan, in force, runs them. */
  allowed: boolean;
  /** Saving redeploys a published storefront in the background. */
  republishing?: boolean;
};

export const pixelsAPI = {
  /** GET /store-pixels */
  fetch: async (): Promise<StorePixelsResponse> => {
    const { data } = await axiosInstance.get<StorePixelsResponse>(
      "/store-pixels",
    );
    return data;
  },

  /** PUT /store-pixels — an empty value clears that network. */
  update: async (pixels: StorePixels): Promise<StorePixelsResponse> => {
    const { data } = await axiosInstance.put<StorePixelsResponse>(
      "/store-pixels",
      pixels,
    );
    return data;
  },
};

import axiosInstance from "@/utils/AxiosInstance";

export const policiesAPI = {
  /**
   * Create terms and conditions for the current store
   */
  createTermsAndConditions: async (content: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/store-policies/terms-and-conditions",
      { content }
    );
    return data;
  },

  /**
   * Get terms and conditions for the current store
   */
  fetchTermsAndConditions: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/store-policies/terms-and-conditions"
    );
    return data;
  },

  /**
   * Update terms and conditions for the current store
   */
  updateTermsAndConditions: async (content: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      "/store-policies/terms-and-conditions",
      { content }
    );
    return data;
  },

  /**
   * Create privacy policy for the current store
   */
  createPrivacyPolicy: async (content: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/store-policies/privacy-policy",
      { content }
    );
    return data;
  },

  /**
   * Get privacy policy for the current store
   */
  fetchPrivacyPolicy: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/store-policies/privacy-policy"
    );
    return data;
  },

  /**
   * Update privacy policy for the current store
   */
  updatePrivacyPolicy: async (content: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      "/store-policies/privacy-policy",
      { content }
    );
    return data;
  },

  /**
   * Create refund policy for the current store
   */
  createRefundPolicy: async (content: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/store-policies/refund-policy",
      { content }
    );
    return data;
  },

  /**
   * Get refund policy for the current store
   */
  fetchRefundPolicy: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>(
      "/store-policies/refund-policy"
    );
    return data;
  },

  /**
   * Update refund policy for the current store
   */
  updateRefundPolicy: async (content: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      "/store-policies/refund-policy",
      { content }
    );
    return data;
  },

  /**
   * Get all policies (terms, privacy, refund) for the current store
   */
  fetchAllPolicies: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/store-policies/all");
    return data;
  },
};

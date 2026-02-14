import axiosInstance from "@/utils/AxiosInstance";

export const authAPI = {
  login: async (params?: any): Promise<any> => {
    const storeName = params?.store?.name ?? params?.name;
    const storeDomain = params?.store?.domain ?? params?.domain;
    const { data } = await axiosInstance.post<any>("/store-user-auth/login", {
      phone: params?.phone,
      store: {
        name: storeName,
        domain: storeDomain,
      },
    });

    console.log("Verification Code: ", data);
    return data;
  },
  devLogin: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/local-idp/login",
      {
        phone: params?.phone,
        store: {
          name: params?.store?.name,
          domain: params?.store?.domain,
        },
      },
      {
        headers: {
          "domain-name": params?.domain,
        },
      }
    );

    console.log("Verification Code: ", data);
    return data;
  },

  validatePhone: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/store-user-auth/validate-phone",
      {
        phone: params?.phone,
      }
    );
    return data;
  },

  verify: async (params?: any): Promise<any> => {
    console.log("VERIFY DTO: ", {
      phone: params?.phone,
      code: params?.code,
      store: {
        name: params?.store?.name,
        domain: params?.store?.domain,
      },
    });

    // Store-user flow: this endpoint sets the `sat` cookie on success
    const { data } = await axiosInstance.post<any>("/store-user-auth/verify", {
      phone: params?.phone,
      code: parseInt(params?.code ?? "0"),
      storeDomain: params?.store?.domain,
      storeName: params?.store?.name,
    });
    return data;
  },

  devVerify: async (params?: any): Promise<any> => {
    // Store-user flow: this endpoint sets the `sat` cookie on success
    const { data } = await axiosInstance.post<any>(
      "/local-idp/verify",
      {
        phone: params?.phone,
        code: parseInt(params?.code),
        storeDomain: params?.store?.domain,
        storeName: params?.store?.name,
      },
      {
        headers: {
          "domain-name": params?.store?.domain,
        },
      }
    );
    return data;
  },

  me: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/store-user-auth/me", {
      headers: { "domain-name": "fashion" },
    });
    return data;
  },

  devMe: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/local-idp/me", {
      headers: { "domain-name": "fashion" },
    });
    return data;
  },

  logout: async (): Promise<any> => {
    const { data } = await axiosInstance.post<any>("/store-user-auth/logout");
    return data;
  },

  refresh: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/store-user-auth/refresh");
    return data;
  },

  updateProfile: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.put<any>(
      "/store-user-auth/update-profile",
      {
        name: params?.name,
        email: params?.email,
        alternative_phone: params?.alternative_phone,
        location: params?.location,
      }
    );
    return data;
  },
};

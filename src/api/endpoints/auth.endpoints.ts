import axiosInstance from "@/utils/AxiosInstance";

/** Auth phones are stored as digits (e.g. 9647701234560), not +964… */
function toAuthPhone(phone: unknown): string {
  return String(phone ?? "").replace(/\D/g, "");
}

function toTenantSlug(domain: unknown): string {
  return String(domain || "")
    .trim()
    .toLowerCase()
    .replace(/^dash\./i, "")
    .split(".")[0];
}

export const authAPI = {
  login: async (params?: any): Promise<any> => {
    const storeName = params?.store?.name ?? params?.name;
    const storeDomain = params?.store?.domain ?? params?.domain;
    const tenant = toTenantSlug(storeDomain);
    const phone = toAuthPhone(params?.phone);

    const { data } = await axiosInstance.post<any>(
      "/store-user-auth/login",
      {
        phone,
        store: {
          name: storeName,
          domain: tenant || storeDomain,
        },
      },
      tenant
        ? {
            headers: {
              "domain-name": tenant,
              "x-tenant-subdomain": tenant,
            },
          }
        : undefined,
    );

    return data;
  },

  validateUserToEditor: async (): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/store-user-auth/validate-to-editor",
    );
    return data;
  },

  validateUser: async (params?: any): Promise<any> => {
    const store = toTenantSlug(params?.store);
    const token = params?.token;
    const { data } = await axiosInstance.post<any>(
      "/store-user-auth/validate-user",
      {
        store,
      },
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined,
    );
    return data;
  },

  resendOtp: async (params?: any): Promise<any> => {
    const storeDomain = params?.store?.domain;
    const tenant = toTenantSlug(storeDomain);
    const phone = toAuthPhone(params?.phone);

    const { data } = await axiosInstance.post<any>(
      "/store-user-auth/resend-otp",
      {
        phone,
        store: {
          name: params?.store?.name,
          domain: tenant || storeDomain,
        },
      },
      tenant
        ? {
            headers: {
              "domain-name": tenant,
              "x-tenant-subdomain": tenant,
            },
          }
        : undefined,
    );
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
      },
    );

    return data;
  },

  validatePhone: async (params?: any): Promise<any> => {
    const { data } = await axiosInstance.post<any>(
      "/store-user-auth/validate-phone",
      {
        phone: params?.phone,
      },
    );
    return data;
  },

  verify: async (params?: any): Promise<any> => {
    // Store-user flow: this endpoint sets the `sat` cookie on success
    const storeDomain = params?.store?.domain ?? params?.storeDomain;
    const tenant = toTenantSlug(storeDomain);
    const phone = toAuthPhone(params?.phone);

    const { data } = await axiosInstance.post<any>(
      "/store-user-auth/verify",
      {
        phone,
        code: parseInt(params?.code ?? "0"),
        storeDomain: tenant || storeDomain,
        storeName: params?.store?.name ?? params?.storeName,
      },
      tenant
        ? {
            headers: {
              "domain-name": tenant,
              "x-tenant-subdomain": tenant,
            },
          }
        : undefined,
    );
    return data;
  },

  consumeBridge: async (params?: any): Promise<any> => {
    // Same-origin on dash.{store}.mel.iq so Safari can accept Set-Cookie
    // via the Worker, instead of a cross-origin call to api.mel.iq.
    const { data } = await axiosInstance.post<any>(
      "/api/v1/store-user-auth/consume-bridge",
      {
        token: params?.token,
      },
      {
        baseURL: "",
        timeout: 10000,
      },
    );
    return data;
  },

  devVerify: async (params?: any): Promise<any> => {
    // Store-user flow: this endpoint sets the `sat` cookie on success
    const { data } = await axiosInstance.post<any>(
      "/store-user-auth/verify",
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
      },
    );
    return data;
  },

  me: async (): Promise<any> => {
    // Uses axiosInstance baseURL (VITE_API_BASE_URL), e.g. http://localhost:3000/api/v1
    // — do not hardcode window.location.origin (that always hits Vite :5173 + proxy).
    const { data } = await axiosInstance.get<any>("/store-user-auth/me", {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    });
    return data;
  },

  devMe: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/local-idp/me");
    return data;
  },

  // me: async (): Promise<any> => {
  //   const { data } = await axiosInstance.get<any>("/store-user-auth/me", {
  //     headers: { "domain-name": "fashion" },
  //   });
  //   return data;
  // },

  // devMe: async (): Promise<any> => {
  //   const { data } = await axiosInstance.get<any>("/local-idp/me", {
  //     headers: { "domain-name": "fashion" },
  //   });
  //   return data;
  // },

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
      },
    );
    return data;
  },
};

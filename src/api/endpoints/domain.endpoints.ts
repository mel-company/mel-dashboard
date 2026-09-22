import axiosInstance from "@/utils/AxiosInstance";

/** One row of the DNS table a merchant has to enter at their own registrar. */
export type DomainDnsRecord = {
  name: string;
  type: "CNAME" | "TXT";
  value: string;
  purpose: "routing" | "ownership" | "ssl";
};

export type CustomHostnameStatus = "pending" | "active" | "failed";

/** Shape of the server's `toCustomDomainResponse` — domain-details, attach and status all return it. */
export type CustomDomainResponse = {
  name: string | null;
  domain: string | null;
  customDomain: string | null;
  domain_last_update: string | null;
  storeUrl: string | null;
  platformUrl: string | null;
  ssl: {
    status: CustomHostnameStatus;
    hostnameStatus: string | null;
    sslStatus: string | null;
    www: {
      status: CustomHostnameStatus;
      hostnameStatus: string;
      sslStatus: string | null;
    } | null;
    verificationErrors: string[];
    error: string | null;
  };
  dns: {
    cnameTarget: string | null;
    records: DomainDnsRecord[];
  };
  domainConnect: DomainConnectDiscovery | null;
};

/** Path 3 only: discover how to connect an already-owned domain. Check only — does not attach. */
export type DomainConnectDiscovery = {
  domain: string;
  connectionMode: "automatic" | "manual";
  automaticAvailable: boolean;
  provider: { displayName: string | null };
  domainConnect?: {
    supported: boolean;
    templateAvailable: boolean;
    reason?: string;
  };
  ui: {
    title: string;
    primaryAction: "connect_automatically" | "connect_manually";
    secondaryAction: "connect_manually" | null;
  };
};

/** Response from POST /domain/connect/start — open applyUrl in the browser. */
export type DomainConnectStartResult = {
  domain: string;
  providerId: string;
  serviceId: string;
  host: string;
  connectionMode: "automatic";
  applyUrl: string;
};

export const domainAPI = {
  /**
   * Find domain details
   */
  findDomainDetails: async (): Promise<CustomDomainResponse> => {
    const { data } =
      await axiosInstance.get<CustomDomainResponse>("/domain/domain-details");
    return data;
  },

  /**
   * Check platform-slug availability (subdomain path)
   */
  checkAvailability: async (domain: string): Promise<{ isAvailable: boolean }> => {
    const { data } = await axiosInstance.post<{ isAvailable: boolean }>(
      "/domain/check-availability",
      { domain },
    );
    return data;
  },

  /**
   * Rename the platform slug.
   *
   * The endpoint takes an inline body rather than a validated DTO. It reads
   * `newDomain` and only falls back to `domain` for older clients, and it
   * resolves the store from the store-user token — `storeId` in the body is
   * used for nothing but an error message.
   */
  updateDomain: async (current: string, next: string): Promise<any> => {
    const { data } = await axiosInstance.put<any>("/domain/update-domain", {
      domain: current,
      newDomain: next.trim().toLowerCase(),
      storeId: "",
    });
    return data;
  },

  /**
   * Attach a custom apex domain (example.com, not a MEL slug). Provisions the
   * Cloudflare Custom Hostnames for the apex and www, and returns the DNS
   * records the merchant must add at their registrar.
   */
  setCustomDomain: async (domain: string): Promise<CustomDomainResponse> => {
    const { data } = await axiosInstance.post<CustomDomainResponse>(
      "/domain/custom-domain",
      { domain: domain.trim().toLowerCase() },
    );
    return data;
  },

  /** Re-read Cloudflare hostname + SSL state for the attached custom domain. */
  getCustomDomainStatus: async (): Promise<CustomDomainResponse> => {
    const { data } = await axiosInstance.get<CustomDomainResponse>(
      "/domain/custom-domain/status",
    );
    return data;
  },

  /**
   * Bring-your-own domain discovery (path 3).
   * Does not store or attach the domain — UI must follow ui.primaryAction, not provider name.
   */
  discoverConnect: async (domain: string): Promise<DomainConnectDiscovery> => {
    const { data } = await axiosInstance.post<DomainConnectDiscovery>(
      "/domain/connect/discover",
      { domain: domain.trim().toLowerCase() },
    );
    return data;
  },

  /**
   * Build signed Domain Connect Apply URL. Does not attach the domain.
   * Do not use next.automatic from discover — applyUrl comes from here.
   */
  startConnect: async (domain: string): Promise<DomainConnectStartResult> => {
    const { data } = await axiosInstance.post<DomainConnectStartResult>(
      "/domain/connect/start",
      { domain: domain.trim().toLowerCase() },
    );
    return data;
  },
};

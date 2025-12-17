import { createContext, useContext, useState, useEffect } from "react";

interface AppStoreApp {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  gradient: string;
  path: string;
  integration: boolean;
  rating: number;
  downloads: number;
}

interface AppsContextType {
  installedApps: string[];
  installApp: (appId: string, appData: AppStoreApp) => void;
  uninstallApp: (appId: string) => void;
  getInstalledAppData: (appId: string) => AppStoreApp | undefined;
  getAllInstalledApps: () => AppStoreApp[];
}

const AppsContext = createContext<AppsContextType | undefined>(undefined);

export function AppsProvider({ children }: { children: React.ReactNode }) {
  const [installedApps, setInstalledApps] = useState<string[]>(() => {
    const stored = localStorage.getItem("installedApps");
    return stored ? JSON.parse(stored) : [];
  });

  const [installedAppsData, setInstalledAppsData] = useState<
    Record<string, AppStoreApp>
  >(() => {
    const stored = localStorage.getItem("installedAppsData");
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem("installedApps", JSON.stringify(installedApps));
  }, [installedApps]);

  useEffect(() => {
    localStorage.setItem(
      "installedAppsData",
      JSON.stringify(installedAppsData)
    );
  }, [installedAppsData]);

  const installApp = (appId: string, appData: AppStoreApp) => {
    setInstalledApps((prev) => {
      if (!prev.includes(appId)) {
        return [...prev, appId];
      }
      return prev;
    });
    setInstalledAppsData((prev) => ({
      ...prev,
      [appId]: appData,
    }));
  };

  const uninstallApp = (appId: string) => {
    setInstalledApps((prev) => prev.filter((id) => id !== appId));
    setInstalledAppsData((prev) => {
      const newData = { ...prev };
      delete newData[appId];
      return newData;
    });
  };

  const getInstalledAppData = (appId: string): AppStoreApp | undefined => {
    return installedAppsData[appId];
  };

  const getAllInstalledApps = (): AppStoreApp[] => {
    return installedApps.map((id) => installedAppsData[id]).filter(Boolean);
  };

  return (
    <AppsContext.Provider
      value={{
        installedApps,
        installApp,
        uninstallApp,
        getInstalledAppData,
        getAllInstalledApps,
      }}
    >
      {children}
    </AppsContext.Provider>
  );
}

export const useApps = () => {
  const context = useContext(AppsContext);
  if (context === undefined) {
    throw new Error("useApps must be used within an AppsProvider");
  }
  return context;
};

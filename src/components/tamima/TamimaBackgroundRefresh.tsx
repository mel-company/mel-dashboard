import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

type TamimaBackgroundRefreshValue = {
  /** Bumps whenever the page behind Tamima should remount/refetch. */
  pageKey: number;
  /**
   * Refresh the dashboard page behind the assistant (not the assistant itself).
   * Optionally navigate first if the merchant should land on another screen.
   */
  refreshBackground: (opts?: { navigateTo?: string }) => void;
};

const TamimaBackgroundRefreshContext =
  createContext<TamimaBackgroundRefreshValue | null>(null);

export function TamimaBackgroundRefreshProvider({
  children,
}: {
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pageKey, setPageKey] = useState(0);

  const refreshBackground = useCallback(
    (opts?: { navigateTo?: string }) => {
      const target = opts?.navigateTo?.trim();
      if (target && target !== location.pathname) {
        navigate(target);
      }
      // Remount Outlet so the page behind Tamima reloads fresh data.
      setPageKey((k) => k + 1);
    },
    [location.pathname, navigate],
  );

  const value = useMemo(
    () => ({ pageKey, refreshBackground }),
    [pageKey, refreshBackground],
  );

  return (
    <TamimaBackgroundRefreshContext.Provider value={value}>
      {children}
    </TamimaBackgroundRefreshContext.Provider>
  );
}

export function useTamimaBackgroundRefresh() {
  const ctx = useContext(TamimaBackgroundRefreshContext);
  if (!ctx) {
    return {
      pageKey: 0,
      refreshBackground: (_opts?: { navigateTo?: string }) => undefined,
    };
  }
  return ctx;
}

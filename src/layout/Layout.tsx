import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import MobileTopBar from "@/components/MobileTopBar";
import FloatingRail, {
  type TamimaEntryMode,
} from "@/components/FloatingRail";
import TamimaAssistant from "@/components/tamima/TamimaAssistant";
import TamimaVoiceSession from "@/components/tamima/TamimaVoiceSession";
import {
  TamimaBackgroundRefreshProvider,
  useTamimaBackgroundRefresh,
} from "@/components/tamima/TamimaBackgroundRefresh";
import TamimaUpgradeDialog from "@/components/plan/TamimaUpgradeDialog";
import { cn } from "@/lib/utils";
import SubscriptionBar from "@/components/plan/SubscriptionBar";
import SubscriptionLifecycleGate from "@/components/plan/SubscriptionLifecycleGate";
import ModuleAccessGate from "@/components/ModuleAccessGate";
import { usePlanEntitlements } from "@/hooks/use-plan-entitlements";

const LayoutInner = () => {
  const location = useLocation();
  const { pageKey } = useTamimaBackgroundRefresh();
  const {
    isLocked,
    data: entitlements,
    isLoading: entitlementsLoading,
  } = usePlanEntitlements();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [tamimaTextOpen, setTamimaTextOpen] = useState(false);
  const [tamimaUpgradeOpen, setTamimaUpgradeOpen] = useState(false);
  const [tamimaVoiceMode, setTamimaVoiceMode] = useState<
    "closed" | "expanded" | "docked"
  >("closed");

  // Grow only (`has_tamima`). Starter → upgrade dialog.
  const tamimaAllowed =
    entitlements?.entitlements?.has_tamima === true && !isLocked("tamima");

  const isPosPage = location.pathname === "/pos";
  const isEditorPage = location.pathname === "/editor";
  const isFullscreenTool = isPosPage || isEditorPage;
  const showMobileChrome = !isFullscreenTool;

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSidebarOpen]);

  const openTamima = (mode: TamimaEntryMode) => {
    if (entitlementsLoading) return;
    if (!tamimaAllowed) {
      setTamimaUpgradeOpen(true);
      return;
    }
    if (mode === "voice") {
      setTamimaTextOpen(false);
      setTamimaVoiceMode("expanded");
      return;
    }
    setTamimaVoiceMode((prev) => (prev === "expanded" ? "docked" : prev));
    setTamimaTextOpen(true);
  };

  return (
    <div className="relative flex h-dvh w-screen overflow-hidden bg-background">
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 lg:hidden",
          mobileSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-label="إغلاق القائمة"
        onClick={() => setMobileSidebarOpen(false)}
      />

      <AppSidebar
        className={cn(
          "fixed inset-y-0 right-0 z-50 transition-transform duration-300 ease-out lg:relative lg:z-10 lg:translate-x-0",
          mobileSidebarOpen
            ? "translate-x-0 shadow-2xl"
            : "translate-x-full lg:translate-x-0",
          "flex",
        )}
        onNavigate={() => setMobileSidebarOpen(false)}
        {...(isFullscreenTool && { collapsed: true })}
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden dark:block"
        >
          <div className="absolute -top-28 -right-24 size-[480px] rounded-full bg-[#9139c4]/18 blur-[140px]" />
        </div>

        {showMobileChrome && (
          <MobileTopBar onMenuClick={() => setMobileSidebarOpen(true)} />
        )}

        {!isEditorPage && <SubscriptionBar />}

        {!isFullscreenTool && (
          <FloatingRail
            onAssistantModeSelect={openTamima}
            hideTamima={tamimaVoiceMode === "docked"}
            assistantOpen={
              tamimaTextOpen || tamimaVoiceMode === "expanded"
            }
          />
        )}

        <TamimaUpgradeDialog
          open={tamimaUpgradeOpen}
          onOpenChange={setTamimaUpgradeOpen}
        />

        {tamimaAllowed ? (
          <>
            <TamimaAssistant
              open={tamimaTextOpen}
              onOpenChange={(open) => {
                setTamimaTextOpen(open);
                if (open) {
                  setTamimaVoiceMode((prev) =>
                    prev === "expanded" ? "docked" : prev,
                  );
                }
              }}
            />
            <TamimaVoiceSession
              mode={tamimaVoiceMode}
              onModeChange={setTamimaVoiceMode}
            />
          </>
        ) : null}

        <main
          className={cn(
            "custom-scrollbar relative z-10 flex-1 overflow-x-hidden",
            isEditorPage
              ? "flex min-h-0 flex-col overflow-hidden"
              : "overflow-y-auto",
          )}
        >
          <div
            className={cn(
              "mx-auto w-full",
              isEditorPage
                ? "flex min-h-0 max-w-none flex-1 flex-col p-0"
                : isPosPage
                  ? "max-w-none p-3 lg:p-5"
                  : "max-w-[1600px] p-3 sm:p-5 md:p-6 lg:p-7 xl:p-8 2xl:px-10",
            )}
          >
            <SubscriptionLifecycleGate>
              <ModuleAccessGate>
                <Outlet key={`${location.pathname}:${pageKey}`} />
              </ModuleAccessGate>
            </SubscriptionLifecycleGate>
          </div>
        </main>
      </div>
    </div>
  );
};

const Layout = () => (
  <TamimaBackgroundRefreshProvider>
    <LayoutInner />
  </TamimaBackgroundRefreshProvider>
);

export default Layout;

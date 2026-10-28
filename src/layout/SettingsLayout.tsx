import { Outlet, useLocation, Navigate } from "react-router-dom";

const ALLOWED_SETTINGS_PATHS = [
  "/settings/general",
  "/settings/store",
] as const;

const SettingsLayout = () => {
  const location = useLocation();

  if (location.pathname === "/settings") {
    return <Navigate to="/settings/general" replace />;
  }

  // The plan used to have its own tab; old links land on store settings.
  if (location.pathname === "/settings/subscription") {
    return <Navigate to="/settings/store" replace />;
  }

  if (
    location.pathname.startsWith("/settings") &&
    !ALLOWED_SETTINGS_PATHS.includes(
      location.pathname as (typeof ALLOWED_SETTINGS_PATHS)[number],
    )
  ) {
    return <Navigate to="/settings/general" replace />;
  }

  return (
    <div className="h-full w-full">
      <Outlet />
    </div>
  );
};

export default SettingsLayout;

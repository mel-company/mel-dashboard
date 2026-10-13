import { Navigate, Outlet, useLocation } from "react-router";
import { useMe } from "../../api/wrappers/auth.wrappers";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";
import EditorSplash from "@/components/EditorSplash";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import {
  clearAuthSession,
  markAuthSession,
} from "@/utils/auth-session";
import { useQueryClient } from "@tanstack/react-query";

const PrivateRoute = () => {
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const theme = useResolvedTheme();

  const {
    data: user,
    isLoading,
    isFetching,
    error,
  } = useMe();

  if (isLoading || (isFetching && !user)) {
    // Headed for the editor: start its splash now, so the session check,
    // the hand-off and the editor's own load read as one wait.
    if (pathname === "/editor") {
      return <EditorSplash theme={theme} className="min-h-screen" />;
    }
    return <AuthLoadingScreen />;
  }

  if (error || !user) {
    clearAuthSession(queryClient);
    return <Navigate to="/login" replace />;
  }

  // Backend confirmed the session.
  // Make the frontend auth state persistent.
  markAuthSession();

  return <Outlet />;
};

export default PrivateRoute;

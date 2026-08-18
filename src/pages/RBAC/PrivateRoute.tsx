import { Navigate, Outlet } from "react-router";
import { useMe } from "../../api/wrappers/auth.wrappers";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";
import {
  clearAuthSession,
  markAuthSession,
} from "@/utils/auth-session";
import { useQueryClient } from "@tanstack/react-query";

const PrivateRoute = () => {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    isFetching,
    error,
  } = useMe();

  if (isLoading || (isFetching && !user)) {
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

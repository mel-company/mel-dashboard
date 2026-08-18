import { Navigate, Outlet } from "react-router";
import { useMe } from "../../api/wrappers/auth.wrappers";
import AuthLoadingScreen from "@/components/AuthLoadingScreen";
import { clearAuthSession, isAuthSessionMarked } from "@/utils/auth-session";
import { useQueryClient } from "@tanstack/react-query";

const PrivateRoute = () => {
  const queryClient = useQueryClient();
  const loggedIn = isAuthSessionMarked();
  const { data: user, isLoading, isFetching, error } = useMe();

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || (isFetching && !user)) {
    return <AuthLoadingScreen />;
  }

  if (error || !user) {
    clearAuthSession(queryClient);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

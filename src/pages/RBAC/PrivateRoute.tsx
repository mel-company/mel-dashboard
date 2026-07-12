import { Navigate, Outlet } from "react-router";
import { useMe } from "../../api/wrappers/auth.wrappers";
import LogoLight from "../../assets/imgs/logo/mel-light.png";
import { clearAuthSession, isAuthSessionMarked } from "@/utils/auth-session";
import { useQueryClient } from "@tanstack/react-query";

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="flex flex-col items-center gap-0">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <img
            src={LogoLight}
            alt="Mel"
            className="relative z-10 h-full w-full animate-pulse object-contain"
          />
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

const PrivateRoute = () => {
  const queryClient = useQueryClient();
  const loggedIn = isAuthSessionMarked();
  const { data: user, isPending, error } = useMe();

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Only block the first auth check — not background refetches
  if (isPending) {
    return <AuthLoadingScreen />;
  }

  if (error || !user) {
    clearAuthSession(queryClient);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

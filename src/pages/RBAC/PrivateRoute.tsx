import { Outlet, useNavigate } from "react-router";
import { useMe } from "../../api/wrappers/auth.wrappers";
import LogoLight from "../../assets/imgs/logo/mel-light.png";
import { useEffect } from "react";

const PrivateRoute = () => {
  const { data: user, isLoading, isFetching, error } = useMe();

  const navigate = useNavigate();

  // Only redirect when auth check has fully settled and user is missing.
  // Don't redirect while loading/fetching to avoid racing after login (user not in state yet).
  useEffect(() => {
    if (!isLoading && !isFetching && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, error, isLoading, isFetching, navigate]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="flex flex-col items-center gap-0">
          <div className="relative flex items-center justify-center w-40 h-40">
            <img
              src={LogoLight}
              alt="Mel"
              className="relative animate-pulse z-10 w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;

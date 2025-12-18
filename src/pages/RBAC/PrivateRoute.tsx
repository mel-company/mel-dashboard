import { Navigate, Outlet } from "react-router";
import { useMe } from "../../api/wrappers/auth.wrappers";

const PrivateRoute = () => {
  const { data: user, isLoading, error } = useMe();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if there's an error or no user data
  if (error || !user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render protected content
  return <Outlet />;
};

export default PrivateRoute;

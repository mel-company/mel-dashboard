import { useEffect } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import { Loader2, Lock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModulePermissions } from "@/hooks/use-module-permissions";
import { moduleForPath } from "@/lib/module-permissions";

/**
 * Blocks employees from routes outside their RolePermission set.
 * Store join lives on /login — here they only request extra module access.
 */
const ModuleAccessGate = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const { isLoading, isOwner, canViewPath, refetch } = useModulePermissions();

  // Pick up owner approvals without a full reload.
  useEffect(() => {
    void refetch();
  }, [pathname, refetch]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-sky-600" />
      </div>
    );
  }

  if (isOwner || canViewPath(pathname)) {
    return <>{children}</>;
  }

  const moduleName = moduleForPath(pathname);
  const canRequest =
    typeof moduleName === "string" && moduleName !== "الإعدادات";

  if (!canRequest) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
        <Lock className="size-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-[#e4e7fc]">
        هذه الوحدة غير مسندة لك
      </h1>
      <p className="text-sm leading-relaxed text-slate-500 dark:text-[#a4b1fa]">
        صلاحياتك تغطي عملك المسند فقط. لفتح «{moduleName}» اطلب صلاحية من
        المالك.
      </p>
      <Button variant="brand" className="h-11 gap-2" asChild>
        <Link to="/request-access">
          <UserPlus className="size-4" />
          طلب صلاحية
        </Link>
      </Button>
    </div>
  );
};

export default ModuleAccessGate;

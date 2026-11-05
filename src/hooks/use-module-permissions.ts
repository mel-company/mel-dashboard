import { useMemo } from "react";
import { useMe } from "@/api/wrappers/auth.wrappers";
import {
  canViewModule,
  canViewPath,
  type ModulePermission,
} from "@/lib/module-permissions";

export function useModulePermissions() {
  const { data: me, isLoading, refetch } = useMe();

  const isOwner = Boolean(me?.isOwner);
  const permissions: ModulePermission[] = useMemo(
    () => (Array.isArray(me?.permissions) ? me.permissions : []),
    [me?.permissions],
  );

  return {
    isLoading,
    isOwner,
    permissions,
    roleName: me?.role as string | undefined,
    refetch,
    canViewModule: (moduleName: string | null | undefined) =>
      canViewModule(isOwner, permissions, moduleName),
    canViewPath: (pathname: string) =>
      canViewPath(pathname, isOwner, permissions),
  };
}

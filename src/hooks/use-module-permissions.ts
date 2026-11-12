import { useMemo } from "react";
import { useMe } from "@/api/wrappers/auth.wrappers";
import {
  canViewModule,
  canViewPath,
  type ModulePermission,
} from "@/lib/module-permissions";

export function useModulePermissions() {
  const { data: me, isLoading, refetch } = useMe();

  const permissionsProvided = Array.isArray(me?.permissions);
  const permissions: ModulePermission[] = useMemo(
    () => (permissionsProvided ? me.permissions : []),
    [me?.permissions, permissionsProvided],
  );

  /**
   * Owner sees the full sidebar. Until /me shipped `isOwner` + `permissions`,
   * missing both meant every merchant looked like an employee with zero
   * modules — only لوحة التحكم + الاشعارات stayed visible.
   *
   * - isOwner true → full access
   * - isOwner false → filter by permissions
   * - isOwner missing + no permissions array → treat as owner (legacy /me)
   */
  const isOwner = useMemo(() => {
    if (me?.isOwner === true) return true;
    if (me?.isOwner === false) return false;
    if (me?.is_owner === true) return true;
    if (me?.is_owner === false) return false;
    // Legacy payload without ownership fields.
    if (!permissionsProvided) return true;
    return false;
  }, [me?.isOwner, me?.is_owner, permissionsProvided]);

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

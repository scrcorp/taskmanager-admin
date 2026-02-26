/**
 * Permission-based RBAC hook.
 *
 * Provides hasPermission() / hasAnyPermission() / hasAllPermissions()
 * based on the permissions[] array from /auth/me.
 */

import { useAuthStore } from "@/stores/authStore";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const permissions = new Set(user?.permissions ?? []);
  const priority = user?.role_priority ?? 999;

  return {
    permissions,
    priority,
    hasPermission: (code: string) => permissions.has(code),
    hasAnyPermission: (...codes: string[]) => codes.some((c) => permissions.has(c)),
    hasAllPermissions: (...codes: string[]) => codes.every((c) => permissions.has(c)),
  };
}

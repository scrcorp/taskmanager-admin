/**
 * 권한 확인 훅 — 현재 사용자 역할 기반 권한 플래그 제공.
 *
 * Permission hook — provides boolean flags based on current user's role level.
 */

import { useAuthStore } from "@/stores/authStore";
import {
  canManageStores,
  canManageStoreConfig,
  canManageChecklists,
  canManageTasks,
  canManageAnnouncements,
  canManageUsers,
} from "@/lib/permissions";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const level = user?.role_level ?? 99;

  return {
    canManageStores: canManageStores(level),
    canManageStoreConfig: canManageStoreConfig(level),
    canManageChecklists: canManageChecklists(level),
    canManageTasks: canManageTasks(level),
    canManageAnnouncements: canManageAnnouncements(level),
    canManageUsers: canManageUsers(level),
    roleLevel: level,
  };
}

/**
 * 권한 기반 RBAC 훅.
 *
 * /auth/me 응답의 permissions[] 배열을 기반으로
 * 권한 확인 유틸리티를 제공합니다.
 *
 * - hasPermission(code): 특정 권한 보유 여부 확인
 * - hasAnyPermission(...codes): 하나라도 보유 시 true
 * - hasAllPermissions(...codes): 모두 보유 시 true
 * - priority: 역할 우선순위 (Owner=10, GM=20, SV=30, Staff=40)
 */

import { useAuthStore } from "@/stores/authStore";

/** 현재 사용자의 권한 정보를 제공하는 훅 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  // Set으로 변환하여 O(1) 조회 성능 보장
  const permissions = new Set(user?.permissions ?? []);
  const priority = user?.role_priority ?? 999; // 999 = 권한 없음(미인증)

  return {
    permissions,
    priority,
    hasPermission: (code: string) => permissions.has(code),
    hasAnyPermission: (...codes: string[]) => codes.some((c) => permissions.has(c)),
    hasAllPermissions: (...codes: string[]) => codes.every((c) => permissions.has(c)),
  };
}

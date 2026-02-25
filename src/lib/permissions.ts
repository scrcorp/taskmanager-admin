/**
 * 역할 기반 권한 유틸리티 — 역할별 권한 설계 문서 기반.
 *
 * Role-based permission utilities derived from the permission design spec.
 * Role levels: Owner(1) > GM(2) > Supervisor(3) > Staff(4)
 */

export const ROLE_LEVEL = {
  OWNER: 1,
  GM: 2,
  SUPERVISOR: 3,
  STAFF: 4,
} as const;

/** Owner만 가능 (level 1). Owner only. */
export function isOwner(level: number): boolean {
  return level <= ROLE_LEVEL.OWNER;
}

/** Owner + GM 가능 (level <= 2). Owner or GM. */
export function isGMOrAbove(level: number): boolean {
  return level <= ROLE_LEVEL.GM;
}

/** Owner + GM + SV 가능 (level <= 3). Supervisor or above. */
export function isSupervisorOrAbove(level: number): boolean {
  return level <= ROLE_LEVEL.SUPERVISOR;
}

/** 매장 CRUD 권한 — Owner만. Store CUD — Owner only. */
export function canManageStores(level: number): boolean {
  return isOwner(level);
}

/** 근무조/직책 CRUD 권한 — Owner + GM. Shift/Position CUD. */
export function canManageStoreConfig(level: number): boolean {
  return isGMOrAbove(level);
}

/** 체크리스트 CRUD 권한 — Owner + GM. Checklist CUD. */
export function canManageChecklists(level: number): boolean {
  return isGMOrAbove(level);
}

/** 추가 업무 CRUD 권한 — Owner + GM. Task CUD. */
export function canManageTasks(level: number): boolean {
  return isGMOrAbove(level);
}

/** 공지사항 CRUD 권한 — Owner + GM. Announcement CUD. */
export function canManageAnnouncements(level: number): boolean {
  return isGMOrAbove(level);
}

/** 사용자 CRUD 권한 — Owner + GM. User CUD. */
export function canManageUsers(level: number): boolean {
  return isGMOrAbove(level);
}

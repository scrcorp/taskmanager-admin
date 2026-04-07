// Schedule status — aligned with backend model
// draft: admin임시저장 (not yet submitted for review)
// requested: 직원 신청 또는 admin이 pending 생성 (awaiting GM approval)
// confirmed: GM이 확정
// rejected: GM이 거절 (사유 기록)
// cancelled: 확정 후 취소 (GM+ only, 사유 기록)
export type ScheduleStatus = 'draft' | 'requested' | 'confirmed' | 'rejected' | 'cancelled' | 'none'
export type Role = 'owner' | 'gm' | 'sv' | 'staff'
export type ViewMode = 'weekly' | 'daily'
export type SortState = 'none' | 'confirmed' | 'requested'

export interface Staff {
  id: string
  initials: string
  name: string
  role: Role
  hourlyRate: number | null // null = no rate set
  position: string
}

export interface ScheduleBlock {
  id: string
  staffId: string
  storeId: string
  date: string // YYYY-MM-DD
  startHour: number // 6 = 6AM, 14 = 2PM
  endHour: number
  // Work role reference + snapshot (id for current link, name for historical)
  workRoleId?: string
  workRoleNameSnapshot: string // "Day" (shift name at creation time)
  positionSnapshot: string // "Manager" (position at creation time)
  hourlyRateSnapshot?: number // $25 (rate at creation time, for payroll accuracy)
  shift: string // legacy — use workRoleNameSnapshot going forward
  status: ScheduleStatus
  isOtherStore?: boolean
  otherStoreName?: string
  // Audit fields
  createdBy?: string // staff id
  createdByRole?: Role
  createdAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  cancelledBy?: string
  cancelledAt?: string
  cancellationReason?: string
}

export type AuditEventType =
  | 'created' | 'requested' | 'modified' | 'confirmed' | 'rejected' | 'cancelled'
  | 'reverted' | 'swapped'

export interface ScheduleAuditEvent {
  id: string
  scheduleId: string
  eventType: AuditEventType
  actorId: string
  actorName: string
  actorRole: Role
  timestamp: string // ISO
  description: string
  reason?: string // for reject/cancel
}

export interface Store {
  id: string
  name: string
  openHour: number // 6 = 6AM
  closeHour: number // 22 = 10PM
}

export interface DaySummary {
  date: string
  dayName: string
  dayNum: string
  teamConfirmed: number
  teamPending: number
  hoursConfirmed: number
  hoursPending: number
  laborConfirmed: number
  laborPending: number
}

export type AttendanceState = 'not_yet' | 'working' | 'on_break' | 'late' | 'clocked_out' | 'no_show'

export interface Attendance {
  id: string
  scheduleId: string
  staffId: string
  date: string
  state: AttendanceState
  clockIn?: string
  clockOut?: string
  breaks: { start: string; end: string; paid: boolean }[]
  actualMinutes?: number
  actualCost?: number
  anomalies: string[]
}

export interface HourSummary {
  hour: number
  label: string // "6AM", "7AM", etc.
  teamConfirmed: number
  teamPending: number
  hoursConfirmed: number
  hoursPending: number
  laborConfirmed: number
  laborPending: number
}

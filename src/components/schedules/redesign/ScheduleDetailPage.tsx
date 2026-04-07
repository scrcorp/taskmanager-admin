import type { ScheduleBlock as ScheduleBlockType, Staff, AuditEventType, ScheduleAuditEvent, Attendance } from './types'
import { roleColors, roleLabels, schedules as mockSchedules, weekDates, getAttendance as mockGetAttendance, getAuditEvents as mockGetAuditEvents } from './mockData'

interface Props {
  block: ScheduleBlockType
  staff: Staff
  showCost: boolean
  /** Optional: when provided, used instead of mock related schedules */
  relatedSchedules?: ScheduleBlockType[]
  /** Optional: when provided, used instead of mock attendance lookup */
  attendance?: Attendance | null
  /** Optional: when provided, used instead of mock audit events */
  auditEvents?: ScheduleAuditEvent[]
  onBack: () => void
  onEdit: () => void
  onSwap: () => void
  onRevert: () => void
  onDelete: () => void
}

function formatHour(h: number): string {
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hr}:00 ${suffix}`
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const statusMeta: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  confirmed: { label: 'Confirmed', bg: 'bg-[var(--color-success-muted)]', text: 'text-[var(--color-success)]', dot: 'bg-[var(--color-success)]' },
  requested: { label: 'Requested', bg: 'bg-[var(--color-warning-muted)]', text: 'text-[var(--color-warning)]', dot: 'bg-[var(--color-warning)]' },
  draft: { label: 'Draft', bg: 'bg-[var(--color-bg)]', text: 'text-[var(--color-text-muted)]', dot: 'bg-[var(--color-text-muted)]' },
  rejected: { label: 'Rejected', bg: 'bg-[var(--color-danger-muted)]', text: 'text-[var(--color-danger)]', dot: 'bg-[var(--color-danger)]' },
  cancelled: { label: 'Cancelled', bg: 'bg-[var(--color-bg)]', text: 'text-[var(--color-text-muted)]', dot: 'bg-[var(--color-text-muted)]' },
  none: { label: 'None', bg: 'bg-[var(--color-bg)]', text: 'text-[var(--color-text-muted)]', dot: 'bg-[var(--color-text-muted)]' },
}

const eventColors: Record<AuditEventType, string> = {
  created: 'bg-[var(--color-info)]',
  requested: 'bg-[var(--color-accent)]',
  modified: 'bg-[var(--color-accent)]',
  confirmed: 'bg-[var(--color-success)]',
  rejected: 'bg-[var(--color-danger)]',
  cancelled: 'bg-[var(--color-text-muted)]',
  reverted: 'bg-[var(--color-warning)]',
  swapped: 'bg-[var(--color-info)]',
}

const eventLabels: Record<AuditEventType, string> = {
  created: 'Created',
  requested: 'Submitted',
  modified: 'Modified',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  reverted: 'Reverted',
  swapped: 'Swapped',
}

function formatEventTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

// Current "live" work role names (would normally come from settings)
const currentWorkRoles: Record<string, string> = {
  'wr-day': 'Day',
  'wr-morning': 'Morning',
  'wr-afternoon': 'Afternoon',
  'wr-open': 'Open',
  'wr-close': 'Close',
}

export function ScheduleDetailPage({ block, staff, showCost, relatedSchedules: relatedSchedulesProp, attendance: attendanceProp, auditEvents: auditEventsProp, onBack, onEdit, onSwap, onRevert, onDelete }: Props) {
  const hours = block.endHour - block.startHour
  const cost = staff.hourlyRate ? hours * staff.hourlyRate : null
  const status = statusMeta[block.status] ?? statusMeta.none
  const weekDateSet = new Set(weekDates.map(d => d.date))
  const relatedSchedules = relatedSchedulesProp ?? mockSchedules.filter(s => s.staffId === staff.id && s.id !== block.id && weekDateSet.has(s.date))
  const attendance = attendanceProp !== undefined ? attendanceProp : mockGetAttendance(block.id)
  const events = auditEventsProp ?? mockGetAuditEvents(block.id)
  const currentRoleName = block.workRoleId ? currentWorkRoles[block.workRoleId] : undefined
  const roleNameChanged = currentRoleName && currentRoleName !== block.workRoleNameSnapshot

  function parseHHmm(t: string): number {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  function formatClock(t?: string): string {
    if (!t) return '—'
    const [hh, mm] = t.split(':').map(Number)
    const suf = hh >= 12 ? 'PM' : 'AM'
    const hr = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh
    return `${hr}:${String(mm).padStart(2, '0')} ${suf}`
  }

  function formatHoursMin(min?: number): string {
    if (!min) return '—'
    const h = Math.floor(min / 60)
    const m = min % 60
    return `${h}h ${String(m).padStart(2, '0')}m`
  }

  const scheduledStartMin = block.startHour * 60
  const scheduledEndMin = block.endHour * 60
  const actualStartMin = attendance?.clockIn ? parseHHmm(attendance.clockIn) : null
  const actualEndMin = attendance?.clockOut ? parseHHmm(attendance.clockOut) : null
  const lateMin = actualStartMin !== null ? Math.max(0, actualStartMin - scheduledStartMin) : 0
  const earlyLeaveMin = actualEndMin !== null ? Math.max(0, scheduledEndMin - actualEndMin) : 0

  const attendanceMeta: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    not_yet: { label: 'Scheduled', bg: 'bg-[var(--color-bg)]', text: 'text-[var(--color-text-muted)]', dot: 'bg-[var(--color-text-muted)]' },
    working: { label: 'Working', bg: 'bg-[var(--color-success-muted)]', text: 'text-[var(--color-success)]', dot: 'bg-[var(--color-success)] animate-pulse' },
    on_break: { label: 'On break', bg: 'bg-[var(--color-warning-muted)]', text: 'text-[var(--color-warning)]', dot: 'bg-[var(--color-warning)]' },
    late: { label: 'Late', bg: 'bg-[var(--color-danger-muted)]', text: 'text-[var(--color-danger)]', dot: 'bg-[var(--color-danger)]' },
    clocked_out: { label: 'Done', bg: 'bg-[var(--color-info-muted,#E0F2FE)]', text: 'text-[var(--color-info)]', dot: 'bg-[var(--color-info)]' },
    no_show: { label: 'No show', bg: 'bg-[var(--color-danger-muted)]', text: 'text-[var(--color-danger)]', dot: 'bg-[var(--color-danger)]' },
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-white flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          aria-label="Back to schedule"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 5 7 9 3" /></svg>
        </button>
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Schedule Detail</h1>
          <p className="text-[12px] text-[var(--color-text-muted)]">View and manage this shift</p>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Staff card */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Staff</div>
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-[16px] font-bold shrink-0 ${roleColors[staff.role]}`}>
                {staff.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-bold text-[var(--color-text)]">{staff.name}</div>
                <div className="flex items-center gap-2 text-[12px] mt-1">
                  <span className={`font-semibold ${staff.role === 'gm' ? 'text-[var(--color-accent)]' : staff.role === 'sv' ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-muted)]'}`}>
                    {roleLabels[staff.role]}
                  </span>
                  <span className="text-[var(--color-text-muted)]">·</span>
                  <span className="text-[var(--color-text-secondary)]">{staff.position}</span>
                  {showCost && staff.hourlyRate && (
                    <>
                      <span className="text-[var(--color-text-muted)]">·</span>
                      <span className="text-[var(--color-text-secondary)]">${staff.hourlyRate}/hr</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule card */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Schedule</div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Date</div>
                <div className="text-[14px] font-semibold text-[var(--color-text)]">{formatFullDate(block.date)}</div>
              </div>
              {(block.status === 'rejected' || block.status === 'cancelled') && (
                <div className={`px-3 py-2 rounded-lg border-l-2 ${block.status === 'rejected' ? 'bg-[var(--color-danger-muted)] border-[var(--color-danger)]' : 'bg-[var(--color-bg)] border-[var(--color-text-muted)]'}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${block.status === 'rejected' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'}`}>
                    {block.status === 'rejected' ? 'Rejection Reason' : 'Cancellation Reason'}
                  </div>
                  <div className="text-[12px] text-[var(--color-text)]">
                    {block.status === 'rejected' ? block.rejectionReason : block.cancellationReason}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Work Role</div>
                  <div className="text-[13px] font-medium text-[var(--color-text)]">
                    {block.workRoleNameSnapshot}
                    {roleNameChanged && (
                      <span className="block text-[10px] font-normal text-[var(--color-text-muted)] italic mt-0.5">
                        (now: {currentRoleName})
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Time</div>
                  <div className="text-[13px] font-medium text-[var(--color-text)]">{formatHour(block.startHour)} – {formatHour(block.endHour)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Total</div>
                  <div className="text-[13px] font-medium text-[var(--color-text)]">{hours} hours</div>
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--color-border)]">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Break Time</div>
                <div className="text-[12px] text-[var(--color-text-secondary)]">30 min meal break + 10 min paid break</div>
              </div>
            </div>
          </div>

          {/* Cost breakdown (GM only) */}
          {showCost && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Cost Breakdown</div>
              {cost !== null ? (
                <div>
                  <div className="flex items-center justify-between text-[13px] py-1.5">
                    <span className="text-[var(--color-text-secondary)]">Hourly rate</span>
                    <span className="font-medium text-[var(--color-text)]">${staff.hourlyRate}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px] py-1.5">
                    <span className="text-[var(--color-text-secondary)]">Hours worked</span>
                    <span className="font-medium text-[var(--color-text)]">{hours}h</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-[var(--color-border)]">
                    <span className="text-[13px] font-semibold text-[var(--color-text)]">Total</span>
                    <span className="text-[18px] font-bold text-[var(--color-success)]">${cost}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[13px] font-medium text-[var(--color-danger)]">No hourly rate set for this staff member</div>
              )}
            </div>
          )}

          {/* Attendance comparison */}
          {attendance && (
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Attendance</div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${attendanceMeta[attendance.state].bg} ${attendanceMeta[attendance.state].text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${attendanceMeta[attendance.state].dot}`} />
                  {attendanceMeta[attendance.state].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Scheduled</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[var(--color-text-secondary)]">Clock in</span>
                      <span className="font-semibold text-[var(--color-text)] tabular-nums">{formatHour(block.startHour)}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[var(--color-text-secondary)]">Clock out</span>
                      <span className="font-semibold text-[var(--color-text)] tabular-nums">{formatHour(block.endHour)}</span>
                    </div>
                    <div className="flex justify-between text-[13px] pt-1.5 border-t border-[var(--color-border)]">
                      <span className="text-[var(--color-text-secondary)]">Total</span>
                      <span className="font-bold text-[var(--color-text)]">{hours}h</span>
                    </div>
                    {showCost && cost !== null && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-[var(--color-text-secondary)]">Cost</span>
                        <span className="font-semibold text-[var(--color-text)]">${cost}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-l border-[var(--color-border)] pl-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Actual</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-[13px]">
                      <span className="text-[var(--color-text-secondary)]">Clock in</span>
                      <span className="text-right">
                        <span className="font-semibold text-[var(--color-text)] tabular-nums">{formatClock(attendance.clockIn)}</span>
                        {lateMin > 0 && <span className="block text-[10px] font-medium text-[var(--color-danger)]">{lateMin} min late</span>}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[13px]">
                      <span className="text-[var(--color-text-secondary)]">Clock out</span>
                      <span className="text-right">
                        <span className="font-semibold text-[var(--color-text)] tabular-nums">{formatClock(attendance.clockOut)}</span>
                        {earlyLeaveMin > 0 && <span className="block text-[10px] font-medium text-[var(--color-warning)]">{earlyLeaveMin} min early</span>}
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px] pt-1.5 border-t border-[var(--color-border)]">
                      <span className="text-[var(--color-text-secondary)]">Total</span>
                      <span className="font-bold text-[var(--color-success)]">{formatHoursMin(attendance.actualMinutes)}</span>
                    </div>
                    {showCost && attendance.actualCost !== undefined && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-[var(--color-text-secondary)]">Cost</span>
                        <span className="font-semibold text-[var(--color-success)]">${attendance.actualCost}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {attendance.anomalies.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Anomalies</div>
                  <div className="flex flex-wrap gap-1.5">
                    {attendance.anomalies.map(a => (
                      <span key={a} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-danger-muted)] text-[var(--color-danger)]">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="5" cy="5" r="4"/><path d="M5 3v2.5"/><circle cx="5" cy="7" r="0.3" fill="currentColor"/></svg>
                        {a.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Notes</div>
            <textarea
              placeholder="Add notes about this shift..."
              className="w-full min-h-[80px] px-3 py-2 text-[12px] border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Audit log */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Audit Log</div>
            {events.length === 0 ? (
              <div className="text-[12px] text-[var(--color-text-muted)] italic">No audit events recorded</div>
            ) : (
              <div className="space-y-3">
                {events.map((e, i) => (
                  <div key={e.id} className={`relative pl-5 pb-3 ${i < events.length - 1 ? 'border-l-2 border-[var(--color-border)] ml-1' : 'ml-1'}`}>
                    <div className={`absolute left-[-5px] top-1 w-[10px] h-[10px] rounded-full ${eventColors[e.eventType]} border-2 border-white`} />
                    <div className="text-[11px] font-semibold text-[var(--color-text-muted)]">{formatEventTime(e.timestamp)}</div>
                    <div className="text-[13px] text-[var(--color-text)] mt-0.5">
                      <span className="font-semibold">{eventLabels[e.eventType]}</span>
                      <span className="font-normal text-[var(--color-text-muted)]"> by {e.actorName} · {roleLabels[e.actorRole]}</span>
                    </div>
                    <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{e.description}</div>
                    {e.reason && (
                      <div className="mt-1.5 px-2.5 py-1.5 bg-[var(--color-bg)] border-l-2 border-[var(--color-danger)] rounded-r text-[11px] text-[var(--color-text-secondary)]">
                        <span className="font-semibold text-[var(--color-text)]">Reason:</span> {e.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Quick Actions</div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onEdit}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                Edit Schedule
              </button>
              <button
                type="button"
                onClick={onSwap}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
              >
                Swap with...
              </button>
              {block.status === 'confirmed' && (
                <button
                  type="button"
                  onClick={onRevert}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                >
                  Revert to Pending
                </button>
              )}
              <button
                type="button"
                onClick={onDelete}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]"
              >
                Delete Schedule
              </button>
            </div>
          </div>

          {/* Related schedules */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
              Related Schedules This Week
            </div>
            {relatedSchedules.length === 0 ? (
              <div className="text-[12px] text-[var(--color-text-muted)] italic">No other schedules this week</div>
            ) : (
              <div className="space-y-2">
                {relatedSchedules.map(rs => {
                  const rsHours = rs.endHour - rs.startHour
                  const rsStatus = statusMeta[rs.status] ?? statusMeta.none
                  return (
                    <div key={rs.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-[var(--color-bg)] rounded-lg">
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-semibold text-[var(--color-text)]">{shortDate(rs.date)}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">
                          {rs.shift} · {formatHour(rs.startHour)}–{formatHour(rs.endHour)} · {rsHours}h
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${rsStatus.bg} ${rsStatus.text}`}>
                        <span className={`w-1 h-1 rounded-full ${rsStatus.dot}`} />
                        {rsStatus.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

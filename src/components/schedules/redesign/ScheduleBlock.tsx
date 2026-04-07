import type { ScheduleBlock as ScheduleBlockType, Staff, Attendance, AttendanceState } from './types'

interface Props {
  block: ScheduleBlockType
  staff: Staff
  showCost: boolean
  compact?: boolean
  onClick?: (e: React.MouseEvent) => void
  attendance?: Attendance
}

const stateDotColors: Record<AttendanceState, string> = {
  not_yet: 'bg-[var(--color-text-muted)]',
  working: 'bg-[var(--color-success)] animate-pulse',
  on_break: 'bg-[var(--color-warning)]',
  late: 'bg-[var(--color-danger)]',
  clocked_out: 'bg-[var(--color-info)]',
  no_show: 'bg-[var(--color-danger)]',
}

const stateTextColors: Record<AttendanceState, string> = {
  not_yet: 'text-[var(--color-text-muted)]',
  working: 'text-[var(--color-success)]',
  on_break: 'text-[var(--color-warning)]',
  late: 'text-[var(--color-danger)]',
  clocked_out: 'text-[var(--color-info)]',
  no_show: 'text-[var(--color-danger)]',
}

const stateLabels: Record<AttendanceState, string> = {
  not_yet: 'Scheduled',
  working: 'Working',
  on_break: 'On break',
  late: 'Late',
  clocked_out: 'Done',
  no_show: 'No show',
}

function elapsedSince(clockIn: string): string {
  // Demo "now" — 11:20 AM (between morning shifts and afternoon)
  const [hh, mm] = clockIn.split(':').map(Number)
  const startMin = hh * 60 + mm
  const nowMin = 11 * 60 + 20
  const diff = Math.max(0, nowMin - startMin)
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

type AlertLevel = 'normal' | 'caution' | 'overtime'

function getAlertLevel(hours: number): AlertLevel {
  if (hours <= 5.5) return 'normal'
  if (hours <= 7.5) return 'caution'
  return 'overtime'
}

const alertStyles: Record<AlertLevel, { border: string; bg: string; bgMuted: string; text: string }> = {
  normal: {
    border: 'border-[var(--color-success)]',
    bg: 'bg-[var(--color-success-muted)]',
    bgMuted: 'rgba(0, 184, 148, 0.06)',
    text: 'text-[var(--color-success)]',
  },
  caution: {
    border: 'border-[var(--color-warning)]',
    bg: 'bg-[var(--color-warning-muted)]',
    bgMuted: 'rgba(240, 165, 0, 0.06)',
    text: 'text-[var(--color-warning)]',
  },
  overtime: {
    border: 'border-[var(--color-danger)]',
    bg: 'bg-[var(--color-danger-muted)]',
    bgMuted: 'rgba(239, 68, 68, 0.06)',
    text: 'text-[var(--color-danger)]',
  },
}

function formatTime(h: number): string {
  if (h === 0 || h === 24) return '12a'
  if (h < 12) return `${h}a`
  if (h === 12) return '12p'
  return `${h - 12}p`
}

export function ScheduleBlock({ block, staff, showCost, onClick, attendance }: Props) {
  const hours = block.endHour - block.startHour
  const cost = staff.hourlyRate ? hours * staff.hourlyRate : null
  const timeRange = `${formatTime(block.startHour)}–${formatTime(block.endHour)}`

  if (block.isOtherStore) {
    return (
      <div
        className="rounded-md border-[1.5px] border-dashed border-[var(--color-text-muted)] px-2 py-1.5 opacity-40 text-[var(--color-text-muted)]"
        title={`Scheduled at ${block.otherStoreName}`}
      >
        <div className="text-[11px] font-semibold leading-tight">{block.shift} · {staff.position}</div>
        <div className="text-[10px] mt-0.5">{timeRange} ({hours}h)</div>
        <div className="text-[10px] mt-0.5">@ {block.otherStoreName}</div>
      </div>
    )
  }

  const level = getAlertLevel(hours)
  const styles = alertStyles[level]
  const isConfirmed = block.status === 'confirmed'
  const isRequested = block.status === 'requested'
  const isDraft = block.status === 'draft'
  const isRejected = block.status === 'rejected'
  const isCancelled = block.status === 'cancelled'

  const pendingBg = isRequested
    ? `repeating-linear-gradient(-45deg, ${styles.bgMuted}, ${styles.bgMuted} 3px, transparent 3px, transparent 6px)`
    : undefined

  // Rejected/cancelled override the alert-level border
  const rejectedClasses = isRejected
    ? 'border-[var(--color-text-muted)] bg-[var(--color-bg)] opacity-60 line-through decoration-[var(--color-danger)] decoration-2'
    : ''
  const cancelledClasses = isCancelled
    ? 'border-dashed border-[var(--color-text-muted)] bg-[var(--color-bg)]/60 opacity-50'
    : ''

  return (
    <div
      onClick={onClick}
      title={isRejected ? `Rejected: ${block.rejectionReason || ''}` : isCancelled ? `Cancelled: ${block.cancellationReason || ''}` : undefined}
      className={`
        group rounded-md border-[1.5px] px-2 py-1.5 cursor-pointer relative
        transition-[box-shadow] duration-150 ease-out hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]
        ${isRejected || isCancelled ? '' : styles.border}
        ${isConfirmed ? styles.bg : ''}
        ${isRequested ? 'border-dashed' : ''}
        ${isDraft ? 'border-dashed border-[var(--color-border)] bg-[var(--color-bg)] opacity-50' : ''}
        ${rejectedClasses}
        ${cancelledClasses}
      `}
      style={isRequested ? { backgroundImage: pendingBg } : undefined}
    >
      {/* Row 1: Shift · Position + hours */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-semibold text-[var(--color-text)] truncate flex-1 min-w-0">
          {block.shift} · {staff.position}
        </span>
        <span className={`text-[11px] font-bold tabular-nums shrink-0 ${styles.text}`}>
          {hours}h
        </span>
      </div>

      {/* Row 2: Time range */}
      <div className="text-[10px] text-[var(--color-text-secondary)] tabular-nums mt-0.5">
        {timeRange}
      </div>

      {/* Row 3: Cost (GM only) */}
      {showCost && cost !== null && (
        <div className={`text-[10px] font-semibold mt-0.5 tabular-nums ${isRequested ? 'opacity-70' : 'text-[var(--color-text)]'}`}>
          ${cost}
        </div>
      )}
      {showCost && cost === null && (
        <div className="text-[10px] font-medium mt-0.5 text-[var(--color-danger)]">No rate</div>
      )}

      {/* Row 4: Status / Attendance */}
      {(isRequested || isDraft || isRejected || isCancelled || (isConfirmed && attendance)) && (
        <div className="flex items-center gap-1 mt-1 pt-1 border-t border-[var(--color-border)]/40 text-[10px] font-medium">
          {isRequested ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)] flex-shrink-0" />
              <span className="text-[var(--color-warning)]">Requested</span>
            </>
          ) : isDraft ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] flex-shrink-0" />
              <span className="text-[var(--color-text-muted)]">Draft</span>
            </>
          ) : isRejected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] flex-shrink-0" />
              <span className="text-[var(--color-danger)] truncate" title={block.rejectionReason}>Rejected</span>
            </>
          ) : isCancelled ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] flex-shrink-0" />
              <span className="text-[var(--color-text-muted)] truncate" title={block.cancellationReason}>Cancelled</span>
            </>
          ) : attendance && (
            <>
              {attendance.state === 'no_show' ? (
                <svg width="9" height="9" viewBox="0 0 9 9" className="text-[var(--color-danger)] flex-shrink-0">
                  <path d="M2 2l5 5M7 2l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${stateDotColors[attendance.state]}`} />
              )}
              <span className={`${stateTextColors[attendance.state]} truncate`}>{stateLabels[attendance.state]}</span>
              {attendance.state === 'working' && attendance.clockIn && (
                <span className="opacity-60 truncate">· {elapsedSince(attendance.clockIn)}</span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

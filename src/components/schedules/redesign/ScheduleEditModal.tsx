import { useState, useEffect } from 'react'
import { useWorkRoles } from '@/hooks/useWorkRoles'
import type { WorkRole as ServerWorkRole } from '@/types'
import type { ScheduleBlock as ScheduleBlockType, Staff } from './types'
import { roleColors } from './mockData'

export interface ScheduleEditPayload {
  staffId: string
  date: string
  startTime: string  // "HH:MM"
  endTime: string
  workRoleId: string | null
  status: 'draft' | 'requested' | 'confirmed'
  notes: string
}

interface Props {
  open: boolean
  mode: 'add' | 'edit'
  block?: ScheduleBlockType | null
  prefilledStaffId?: string
  prefilledDate?: string
  staffList: Staff[]
  /** 현재 선택된 store id — work role 목록 fetch 용 */
  storeId: string
  onClose: () => void
  onSave: (payload: ScheduleEditPayload) => void
  onDelete?: () => void
  isSaving?: boolean
}

function hourToTime(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function workRoleLabel(wr: ServerWorkRole): string {
  if (wr.name) return wr.name
  return `${wr.shift_name ?? ''} - ${wr.position_name ?? ''}`.trim()
}

export function ScheduleEditModal({ open, mode, block, prefilledStaffId, prefilledDate, staffList, storeId, onClose, onSave, onDelete, isSaving }: Props) {
  const [staffId, setStaffId] = useState(prefilledStaffId || staffList[0]?.id || '')
  const [date, setDate] = useState(prefilledDate || new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [workRoleId, setWorkRoleId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'draft' | 'requested' | 'confirmed'>('draft')

  // 현재 store의 work role 목록 (shift × position)
  const workRolesQ = useWorkRoles(storeId || undefined)
  const workRoles = workRolesQ.data ?? []

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && block) {
      setStaffId(block.staffId)
      setDate(block.date)
      setStartTime(hourToTime(block.startHour))
      setEndTime(hourToTime(block.endHour))
      setWorkRoleId(block.workRoleId ?? '')
      setStatus(
        block.status === 'confirmed' || block.status === 'requested' || block.status === 'draft'
          ? block.status
          : 'draft'
      )
      setNotes('')
    } else if (mode === 'add') {
      setStaffId(prefilledStaffId || staffList[0]?.id || '')
      setDate(prefilledDate || new Date().toISOString().slice(0, 10))
      setStartTime('09:00')
      setEndTime('17:00')
      setWorkRoleId('')
      setNotes('')
      setStatus('draft')
    }
  }, [open, mode, block, prefilledStaffId, prefilledDate, staffList])

  // work role 선택 시 default time 자동 채움 (add mode + 빈 시간일 때)
  useEffect(() => {
    if (!workRoleId) return
    const wr = workRoles.find(w => w.id === workRoleId)
    if (!wr) return
    if (mode === 'add' && wr.default_start_time && wr.default_end_time) {
      setStartTime(wr.default_start_time.slice(0, 5))
      setEndTime(wr.default_end_time.slice(0, 5))
    }
  }, [workRoleId, workRoles, mode])

  if (!open) return null

  const selectedStaff = staffList.find(s => s.id === staffId)

  function handleSave() {
    onSave({
      staffId, date, startTime, endTime,
      workRoleId: workRoleId || null,
      status, notes,
    })
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[var(--color-text)]">
            {mode === 'add' ? 'Add Schedule' : 'Edit Schedule'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-text-muted)]"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-3.5">
          {/* Staff */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Staff</label>
            <div className="flex items-center gap-2">
              {selectedStaff && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${roleColors[selectedStaff.role]}`}>
                  {selectedStaff.initials}
                </div>
              )}
              <select
                value={staffId}
                onChange={e => setStaffId(e.target.value)}
                className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] bg-white"
              >
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} — {s.position}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] bg-white"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">End</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] bg-white"
              />
            </div>
          </div>

          {/* Work Role (shift × position) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Work Role</label>
            <select
              value={workRoleId}
              onChange={e => setWorkRoleId(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] bg-white"
            >
              <option value="">— None (no role) —</option>
              {workRolesQ.isLoading && <option disabled>Loading…</option>}
              {workRoles.map(wr => (
                <option key={wr.id} value={wr.id}>{workRoleLabel(wr)}</option>
              ))}
            </select>
            {workRoles.length === 0 && !workRolesQ.isLoading && (
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                No work roles defined for this store yet. Add some in Schedule Settings.
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Status</label>
            <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-0.5">
              {(['draft', 'requested', 'confirmed'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-[12px] font-semibold capitalize transition-all ${status === s ? 'bg-white shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any notes about this shift..."
              className="w-full min-h-[60px] px-3 py-2 text-[12px] border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--color-border)] flex items-center gap-2">
          {mode === 'edit' && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-3.5 py-2 rounded-lg text-[12px] font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]"
            >
              Delete
            </button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

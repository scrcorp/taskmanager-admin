import { useState, useEffect } from 'react'
import type { ScheduleBlock as ScheduleBlockType } from './types'
import { staff, roleColors } from './mockData'

interface Props {
  open: boolean
  mode: 'add' | 'edit'
  block?: ScheduleBlockType | null
  prefilledStaffId?: string
  prefilledDate?: string
  onClose: () => void
  onSave: () => void
  onDelete?: () => void
}

const POSITIONS = ['Manager', 'Server', 'Barista', 'Kitchen', 'Cashier']
const SHIFTS = ['Open', 'Morning', 'Day', 'Afternoon', 'Close']

function hourToTime(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export function ScheduleEditModal({ open, mode, block, prefilledStaffId, prefilledDate, onClose, onSave, onDelete }: Props) {
  const [staffId, setStaffId] = useState(prefilledStaffId || staff[0].id)
  const [date, setDate] = useState(prefilledDate || '2026-04-01')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [shift, setShift] = useState('Day')
  const [position, setPosition] = useState('Server')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'draft' | 'requested' | 'confirmed'>('draft')

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && block) {
      setStaffId(block.staffId)
      setDate(block.date)
      setStartTime(hourToTime(block.startHour))
      setEndTime(hourToTime(block.endHour))
      setShift(block.shift)
      const st = staff.find(s => s.id === block.staffId)
      setPosition(st?.position || 'Server')
      setStatus(
        block.status === 'confirmed' || block.status === 'requested' || block.status === 'draft'
          ? block.status
          : 'draft'
      )
      setNotes('')
    } else if (mode === 'add') {
      setStaffId(prefilledStaffId || staff[0].id)
      setDate(prefilledDate || '2026-04-01')
      setStartTime('09:00')
      setEndTime('17:00')
      setShift('Day')
      setPosition('Server')
      setNotes('')
      setStatus('draft')
    }
  }, [open, mode, block, prefilledStaffId, prefilledDate])

  if (!open) return null

  const selectedStaff = staff.find(s => s.id === staffId)

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
                {staff.map(s => (
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

          {/* Shift + Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Shift</label>
              <select
                value={shift}
                onChange={e => setShift(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] bg-white"
              >
                {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Position</label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] bg-white"
              >
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
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
              onClick={onSave}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'

export interface WorkRole {
  id: string
  name: string
  color: string
  requiredStaffRange: string
  breakMinutes: string
  hourlyRate: number
}

interface Props {
  open: boolean
  mode: 'add' | 'edit'
  role?: WorkRole | null
  onClose: () => void
  onSave: (role: WorkRole) => void
}

const COLOR_PALETTE = [
  '#6C5CE7', '#00B894', '#F0A500', '#EF4444',
  '#3B82F6', '#EC4899', '#14B8A6', '#8B5CF6',
]

export function WorkRoleModal({ open, mode, role, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PALETTE[0])
  const [hourlyRate, setHourlyRate] = useState(15)
  const [breakMin, setBreakMin] = useState(30)
  const [breakPerHours, setBreakPerHours] = useState(6)
  const [minStaff, setMinStaff] = useState(1)
  const [maxStaff, setMaxStaff] = useState(2)

  useEffect(() => {
    if (open && role) {
      setName(role.name)
      setColor(role.color)
      setHourlyRate(role.hourlyRate)
      // Parse break "30 min per 6h"
      const breakMatch = role.breakMinutes.match(/(\d+)\s*min.*?(\d+)h/)
      if (breakMatch) {
        setBreakMin(parseInt(breakMatch[1]))
        setBreakPerHours(parseInt(breakMatch[2]))
      }
      // Parse staff range
      const staffMatch = role.requiredStaffRange.match(/(\d+)(?:-(\d+))?/)
      if (staffMatch) {
        setMinStaff(parseInt(staffMatch[1]))
        setMaxStaff(staffMatch[2] ? parseInt(staffMatch[2]) : parseInt(staffMatch[1]))
      }
    } else if (open && !role) {
      // Reset for add mode
      setName('')
      setColor(COLOR_PALETTE[0])
      setHourlyRate(15)
      setBreakMin(30)
      setBreakPerHours(6)
      setMinStaff(1)
      setMaxStaff(2)
    }
  }, [open, role])

  if (!open) return null

  function handleSave() {
    onSave({
      id: role?.id || `r${Date.now()}`,
      name,
      color,
      hourlyRate,
      breakMinutes: `${breakMin} min per ${breakPerHours}h`,
      requiredStaffRange: minStaff === maxStaff ? `${minStaff} (all hours)` : `${minStaff}-${maxStaff} (varies by time)`,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[var(--color-text)]">
            {mode === 'add' ? 'Add Work Role' : 'Edit Work Role'}
          </h2>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="11" y1="3" x2="3" y2="11"/><line x1="3" y1="3" x2="11" y2="11"/></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1.5">Role Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Manager, Server, Barista"
              className="w-full px-3 py-2 bg-white border border-[var(--color-border)] rounded-lg text-[13px]"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1.5">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-[var(--color-text)]' : ''}`}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Required Staff */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1.5">Required Staff per Time Slot</label>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--color-text-muted)]">Min</span>
              <input type="number" min="0" value={minStaff} onChange={e => setMinStaff(parseInt(e.target.value) || 0)} className="w-16 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
              <span className="text-[12px] text-[var(--color-text-muted)]">Max</span>
              <input type="number" min="0" value={maxStaff} onChange={e => setMaxStaff(parseInt(e.target.value) || 0)} className="w-16 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
              <span className="text-[11px] text-[var(--color-text-muted)] ml-1">staff</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Use min=max for fixed staffing across all hours</p>
          </div>

          {/* Default Break */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1.5">Default Break</label>
            <div className="flex items-center gap-2">
              <input type="number" value={breakMin} onChange={e => setBreakMin(parseInt(e.target.value) || 0)} className="w-16 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
              <span className="text-[12px] text-[var(--color-text-muted)]">min per</span>
              <input type="number" value={breakPerHours} onChange={e => setBreakPerHours(parseInt(e.target.value) || 0)} className="w-16 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
              <span className="text-[12px] text-[var(--color-text-muted)]">hours worked</span>
            </div>
          </div>

          {/* Default Rate */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--color-text)] mb-1.5">Default Hourly Rate</label>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[var(--color-text-muted)]">$</span>
              <input type="number" value={hourlyRate} step="0.5" onChange={e => setHourlyRate(parseFloat(e.target.value) || 0)} className="w-24 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
              <span className="text-[12px] text-[var(--color-text-muted)]">/ hour</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Used as default when assigning new staff to this role</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {mode === 'add' ? 'Create Role' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

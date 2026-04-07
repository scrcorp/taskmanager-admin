import { staff } from './mockData'

interface Props {
  open: boolean
  onClose: () => void
  fromStaff?: string
  fromDate?: string
  fromTime?: string
}

export function SwapModal({ open, onClose, fromStaff = 'Sarah Kim', fromDate = 'Mon 3/30', fromTime = '08:00-17:00 Morning' }: Props) {
  if (!open) return null

  const otherStaff = staff.filter(s => s.name !== fromStaff)

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[16px] font-bold text-[var(--color-text)]">Swap Schedule</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-[var(--color-bg)] rounded-lg p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">From</div>
            <div className="text-[14px] font-semibold text-[var(--color-text)]">{fromStaff}</div>
            <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{fromDate} · {fromTime}</div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[var(--color-text)] mb-1.5">Swap with</label>
            <select className="w-full px-3 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[13px]">
              <option value="">Select employee...</option>
              {otherStaff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.position})</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--color-info-muted)] rounded-lg text-[var(--color-info)] text-[12px]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><line x1="8" y1="6" x2="8" y2="8"/><line x1="8" y1="10" x2="8" y2="10"/></svg>
            Both employees will be notified of the swap.
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">Cancel</button>
          <button className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]">Confirm Swap</button>
        </div>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { stores, staff, schedules, attendances, weekDates, roleColors, roleLabels } from './mockData'

function formatHoursShort(min: number | undefined): string {
  if (!min) return ''
  const h = Math.floor(min / 60)
  const m = min % 60
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}

export function AttendanceSummaryPage() {
  const [selectedStore, setSelectedStore] = useState('main')

  const rows = useMemo(() => {
    return staff.map(st => {
      const cells = weekDates.map(d => {
        const sch = schedules.find(s => s.staffId === st.id && s.date === d.date && s.storeId === selectedStore)
        if (!sch) return null
        const att = attendances.find(a => a.scheduleId === sch.id)
        const schedMin = (sch.endHour - sch.startHour) * 60
        return { sch, att, schedMin }
      })
      const totalScheduledMin = cells.reduce((sum, c) => sum + (c?.schedMin || 0), 0)
      const totalActualMin = cells.reduce((sum, c) => sum + (c?.att?.actualMinutes || 0), 0)
      const totalCost = cells.reduce((sum, c) => sum + (c?.att?.actualCost || 0), 0)
      const anomalyCount = cells.reduce((sum, c) => sum + (c?.att?.anomalies.length || 0), 0)
      return { st, cells, totalScheduledMin, totalActualMin, totalCost, anomalyCount }
    }).filter(r => r.cells.some(c => c !== null))
  }, [selectedStore])

  const totals = useMemo(() => {
    const scheduledMin = rows.reduce((s, r) => s + r.totalScheduledMin, 0)
    const actualMin = rows.reduce((s, r) => s + r.totalActualMin, 0)
    const anomalies = rows.reduce((s, r) => s + r.anomalyCount, 0)
    const cost = rows.reduce((s, r) => s + r.totalCost, 0)
    return { scheduledMin, actualMin, anomalies, cost }
  }, [rows])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 pb-1">
        <select
          value={selectedStore}
          onChange={e => setSelectedStore(e.target.value)}
          className="px-3 py-1.5 bg-white border-2 border-[var(--color-accent)] rounded-lg text-[13px] font-semibold text-[var(--color-accent)] cursor-pointer"
        >
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <span className="text-[12px] text-[var(--color-text-muted)]">Weekly attendance rollup</span>
      </div>

      <div className="flex items-center justify-between py-2 gap-3 flex-wrap">
        <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Weekly Summary</h1>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-white flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]" aria-label="Previous week">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 5 7 9 3"/></svg>
          </button>
          <span className="text-[13px] font-semibold text-[var(--color-text)] min-w-[140px] text-center">Mar 29 – Apr 4, 2026</span>
          <button className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-white flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]" aria-label="Next week">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="5 3 9 7 5 11"/></svg>
          </button>
          <button type="button" className="ml-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Scheduled Hours" value={formatHoursShort(totals.scheduledMin) || '0h'} color="text-[var(--color-text)]" />
        <StatCard label="Actual Hours" value={formatHoursShort(totals.actualMin) || '0h'} color="text-[var(--color-success)]" />
        <StatCard label="Anomalies" value={String(totals.anomalies)} color="text-[var(--color-danger)]" />
        <StatCard label="Labor Cost" value={`$${totals.cost}`} color="text-[var(--color-success)]" />
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-x-auto">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 200 }} />
            {weekDates.map(d => <col key={d.date} />)}
            <col style={{ width: 100 }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] border-r-2 border-[var(--color-border)]">Employee</th>
              {weekDates.map(d => (
                <th key={d.date} className={`px-2 py-2.5 text-center text-[11px] font-bold border-r border-[var(--color-border)] ${d.isSunday ? 'text-[var(--color-danger)]' : d.isWeekend ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                  <div>{d.dayName}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] font-normal">{d.dayNum}</div>
                </th>
              ))}
              <th className="text-center px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.st.id} className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-hover)]">
                <td className="px-4 py-3 border-r-2 border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${roleColors[r.st.role]}`}>{r.st.initials}</div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--color-text)] truncate">{r.st.name}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">
                        <span className={r.st.role === 'gm' ? 'text-[var(--color-accent)] font-semibold' : r.st.role === 'sv' ? 'text-[var(--color-warning)] font-semibold' : 'font-semibold'}>{roleLabels[r.st.role]}</span>
                      </div>
                    </div>
                  </div>
                </td>
                {r.cells.map((c, i) => (
                  <td key={i} className="px-2 py-3 text-center border-r border-[var(--color-border)]/40">
                    {c ? (
                      <div>
                        <div className="text-[12px] font-semibold text-[var(--color-text)] tabular-nums">
                          {c.att?.actualMinutes ? formatHoursShort(c.att.actualMinutes) : <span className="text-[var(--color-text-muted)]">{formatHoursShort(c.schedMin)}</span>}
                        </div>
                        {c.att?.anomalies.length ? (
                          <div className="flex justify-center gap-0.5 mt-0.5">
                            {c.att.anomalies.slice(0, 2).map(a => (
                              <span key={a} className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" title={a} />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-[11px] text-[var(--color-text-muted)] opacity-40">—</span>
                    )}
                  </td>
                ))}
                <td className="px-2 py-3 text-center">
                  <div className="text-[13px] font-bold text-[var(--color-success)] tabular-nums">{formatHoursShort(r.totalActualMin) || '—'}</div>
                  {r.totalCost > 0 && <div className="text-[10px] text-[var(--color-text-secondary)]">${r.totalCost}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</div>
      <div className={`text-[22px] font-bold mt-1 tabular-nums ${color}`}>{value}</div>
    </div>
  )
}

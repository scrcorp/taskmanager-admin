import { useState, useMemo } from 'react'
import { stores, staff, schedules, attendances, today, roleColors, roleLabels } from './mockData'
import type { AttendanceState } from './types'

const stateMeta: Record<AttendanceState, { label: string; bg: string; text: string; dot: string }> = {
  not_yet: { label: 'Scheduled', bg: 'bg-[var(--color-bg)]', text: 'text-[var(--color-text-muted)]', dot: 'bg-[var(--color-text-muted)]' },
  working: { label: 'Working', bg: 'bg-[var(--color-success-muted)]', text: 'text-[var(--color-success)]', dot: 'bg-[var(--color-success)] animate-pulse' },
  on_break: { label: 'On break', bg: 'bg-[var(--color-warning-muted)]', text: 'text-[var(--color-warning)]', dot: 'bg-[var(--color-warning)]' },
  late: { label: 'Late', bg: 'bg-[var(--color-danger-muted)]', text: 'text-[var(--color-danger)]', dot: 'bg-[var(--color-danger)]' },
  clocked_out: { label: 'Done', bg: 'bg-[var(--color-info-muted,#E0F2FE)]', text: 'text-[var(--color-info)]', dot: 'bg-[var(--color-info)]' },
  no_show: { label: 'No show', bg: 'bg-[var(--color-danger-muted)]', text: 'text-[var(--color-danger)]', dot: 'bg-[var(--color-danger)]' },
}

const tabs: { key: AttendanceState | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'working', label: 'Clocked In' },
  { key: 'on_break', label: 'On Break' },
  { key: 'late', label: 'Late' },
  { key: 'no_show', label: 'No Show' },
  { key: 'clocked_out', label: 'Done' },
]

function formatHour(h: number): string {
  const suf = h >= 12 ? 'PM' : 'AM'
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hr}:00 ${suf}`
}

function formatHHmm(t?: string): string {
  if (!t) return '—'
  const [hh, mm] = t.split(':').map(Number)
  const suf = hh >= 12 ? 'PM' : 'AM'
  const hr = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh
  return `${hr}:${String(mm).padStart(2, '0')} ${suf}`
}

function formatHours(min?: number): string {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

export function AttendancePage() {
  const [selectedStore, setSelectedStore] = useState('main')
  const [tab, setTab] = useState<AttendanceState | 'all'>('all')
  const [date] = useState(today)

  const rows = useMemo(() => {
    const todays = attendances.filter(a => a.date === date)
    return todays
      .map(a => {
        const sch = schedules.find(s => s.id === a.scheduleId)
        const st = staff.find(x => x.id === a.staffId)
        if (!sch || !st || sch.storeId !== selectedStore) return null
        return { att: a, sch, st }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [date, selectedStore])

  const filtered = useMemo(() => {
    if (tab === 'all') return rows
    return rows.filter(r => r.att.state === tab)
  }, [rows, tab])

  const stats = useMemo(() => ({
    scheduled: rows.length,
    working: rows.filter(r => r.att.state === 'working').length,
    onBreak: rows.filter(r => r.att.state === 'on_break').length,
    late: rows.filter(r => r.att.state === 'late').length,
    noShow: rows.filter(r => r.att.state === 'no_show').length,
  }), [rows])

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
        <span className="text-[12px] text-[var(--color-text-muted)]">Live attendance tracking</span>
      </div>

      <div className="flex items-center justify-between py-2 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Attendance</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-white flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]" aria-label="Previous day">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 5 7 9 3"/></svg>
          </button>
          <span className="text-[13px] font-semibold text-[var(--color-text)] min-w-[140px] text-center">Tue, Apr 7, 2026</span>
          <button className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-white flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]" aria-label="Next day">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="5 3 9 7 5 11"/></svg>
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <StatCard label="Scheduled" value={stats.scheduled} color="text-[var(--color-text)]" />
        <StatCard label="Clocked In" value={stats.working} color="text-[var(--color-success)]" />
        <StatCard label="Late" value={stats.late} color="text-[var(--color-danger)]" />
        <StatCard label="On Break" value={stats.onBreak} color="text-[var(--color-warning)]" />
        <StatCard label="No Show" value={stats.noShow} color="text-[var(--color-danger)]" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <th className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Employee</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Scheduled</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Clock In</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Clock Out</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Hours</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Anomalies</th>
              <th className="text-right px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[12px] text-[var(--color-text-muted)] italic">No records match this filter</td>
              </tr>
            )}
            {filtered.map(({ att, sch, st }) => {
              const meta = stateMeta[att.state]
              const schedHours = sch.endHour - sch.startHour
              return (
                <tr key={att.id} className="border-b border-[var(--color-border)] last:border-b-0 group hover:bg-[var(--color-surface-hover)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${roleColors[st.role]}`}>{st.initials}</div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-[var(--color-text)] truncate">{st.name}</div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">
                          <span className={st.role === 'gm' ? 'text-[var(--color-accent)] font-semibold' : st.role === 'sv' ? 'text-[var(--color-warning)] font-semibold' : 'font-semibold'}>{roleLabels[st.role]}</span>
                          {' · '}{st.position}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-[12px] font-semibold text-[var(--color-text)]">{formatHour(sch.startHour)}–{formatHour(sch.endHour)}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">{sch.shift} · {schedHours}h</div>
                  </td>
                  <td className="px-3 py-3 text-[12px] tabular-nums text-[var(--color-text)]">{formatHHmm(att.clockIn)}</td>
                  <td className="px-3 py-3 text-[12px] tabular-nums text-[var(--color-text)]">{formatHHmm(att.clockOut)}</td>
                  <td className="px-3 py-3 text-[12px] tabular-nums font-semibold text-[var(--color-text)]">{formatHours(att.actualMinutes)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold ${meta.bg} ${meta.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {att.anomalies.length === 0 && <span className="text-[11px] text-[var(--color-text-muted)]">—</span>}
                      {att.anomalies.map(a => (
                        <span key={a} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-danger-muted)] text-[var(--color-danger)]">
                          {a.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[var(--color-border)] hover:bg-white text-[var(--color-text-secondary)]"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</div>
      <div className={`text-[24px] font-bold mt-1 tabular-nums ${color}`}>{value}</div>
    </div>
  )
}

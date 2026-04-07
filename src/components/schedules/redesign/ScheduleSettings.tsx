import { useState } from 'react'
import { WorkRoleModal, type WorkRole as WorkRoleType } from './WorkRoleModal'
import { ConfirmDialog } from './ConfirmDialog'

interface Props {
  showLabor: boolean
  onBack: () => void
}

type SectionProps = {
  id: string
  title: string
  subtitle: string
  locked?: boolean
  isCustom?: boolean
  isExpanded: boolean
  onToggle: () => void
  inheritable?: boolean
  isInherited?: boolean
  onToggleInherit?: () => void
  parentLabel?: string
  children: React.ReactNode
}

function Section({ title, subtitle, locked, isCustom, isExpanded, onToggle, inheritable, isInherited, onToggleInherit, parentLabel = 'Organization', children }: SectionProps) {
  const showInherited = inheritable && isInherited
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-[var(--color-surface-hover)] transition-[background-color] duration-100"
      >
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[var(--color-text)]">{title}</span>
            {locked && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-danger-muted)] text-[var(--color-danger)]">
                Locked by Org
              </span>
            )}
            {inheritable && isInherited && !locked && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-info-muted)] text-[var(--color-info)]">
                Inherited
              </span>
            )}
            {inheritable && !isInherited && !locked && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                Custom
              </span>
            )}
            {!inheritable && isCustom && !locked && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                Custom
              </span>
            )}
          </div>
          <span className="text-[12px] text-[var(--color-text-muted)]">{subtitle}</span>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round"
          className={`transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="4 6 8 10 12 6" />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 pt-1 border-t border-[var(--color-border)]">
          {inheritable && onToggleInherit && (
            <div className="flex items-center justify-between py-3 mb-2 border-b border-[var(--color-border)]">
              <div>
                <div className="text-[12px] font-semibold text-[var(--color-text)]">Inherit from {parentLabel}</div>
                <div className="text-[11px] text-[var(--color-text-muted)]">Use parent settings (override to customize)</div>
              </div>
              <button
                type="button"
                onClick={onToggleInherit}
                className={`relative w-10 h-[22px] rounded-full transition-colors duration-150 cursor-pointer ${isInherited ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
              >
                <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${isInherited ? 'left-[22px]' : 'left-[3px]'}`} />
              </button>
            </div>
          )}
          <div className={showInherited ? 'opacity-50 pointer-events-none' : ''}>
            {showInherited && (
              <div className="text-[11px] text-[var(--color-info)] bg-[var(--color-info-muted)] rounded-lg px-3 py-2 mb-3">
                Using {parentLabel.toLowerCase()} defaults. Toggle off to customize.
              </div>
            )}
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

type ToggleProps = {
  label: string
  description?: string
  defaultChecked?: boolean
  locked?: boolean
}

function Toggle({ label, description, defaultChecked = false, locked = false }: ToggleProps) {
  const [on, setOn] = useState(defaultChecked)
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-[13px] font-medium text-[var(--color-text)]">{label}</div>
        {description && <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => !locked && setOn(!on)}
        className={`relative w-10 h-[22px] rounded-full transition-colors duration-150 ${on ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'} ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${on ? 'left-[22px]' : 'left-[3px]'}`} />
      </button>
    </div>
  )
}

type EnforcementMode = 'warning' | 'hard'

function EnforcementPill({ value, onChange }: { value: EnforcementMode; onChange: (v: EnforcementMode) => void }) {
  return (
    <div className="inline-flex bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md p-0.5">
      {(['warning', 'hard'] as const).map(m => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${value === m ? (m === 'hard' ? 'bg-[var(--color-danger)] text-white' : 'bg-[var(--color-warning)] text-white') : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
        >
          {m === 'warning' ? 'Warning only' : 'Hard block'}
        </button>
      ))}
    </div>
  )
}

type WorkRole = WorkRoleType

export function ScheduleSettings({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'org' | 'main' | 'downtown'>('main')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    workHour: true,
    weeklyLimits: false,
    approval: false,
    breaks: false,
    presets: false,
    workRoles: false,
  })

  const [inherited, setInherited] = useState<Record<string, boolean>>({
    workHour: true,
    weeklyLimits: true,
    approval: true,
    breaks: true,
    presets: true,
    workRoles: true,
  })

  function toggleInherit(key: string) {
    setInherited(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Task 1: work hour alert state
  const [normalMax, setNormalMax] = useState(5.5)
  const [cautionMax, setCautionMax] = useState(7.5)

  function handleNormalChange(raw: string) {
    const x = parseFloat(raw)
    if (isNaN(x)) return
    setNormalMax(x)
    if (x >= cautionMax) setCautionMax(x + 0.5)
  }

  function handleCautionChange(raw: string) {
    const x = parseFloat(raw)
    if (isNaN(x)) return
    setCautionMax(x)
    if (x <= normalMax) setNormalMax(x - 0.5)
  }

  const MAX_SCALE = 12
  const normalPct = Math.max(0, Math.min(100, (normalMax / MAX_SCALE) * 100))
  const cautionPct = Math.max(0, Math.min(100 - normalPct, ((cautionMax - normalMax) / MAX_SCALE) * 100))

  // Task 2: weekly limits enforcement state
  const [maxWeeklyMode, setMaxWeeklyMode] = useState<EnforcementMode>('warning')
  const [maxConsecMode, setMaxConsecMode] = useState<EnforcementMode>('warning')

  // Task 4: work roles
  const [workRoles, setWorkRoles] = useState<WorkRole[]>([
    { id: 'r1', name: 'Manager', color: '#6C5CE7', requiredStaffRange: '1 (all hours)', breakMinutes: '30 min per 6h', hourlyRate: 25 },
    { id: 'r2', name: 'Server', color: '#00B894', requiredStaffRange: '1-3 (varies by time)', breakMinutes: '30 min per 6h', hourlyRate: 15 },
    { id: 'r3', name: 'Barista', color: '#F0A500', requiredStaffRange: '1-2 (varies by time)', breakMinutes: '30 min per 6h', hourlyRate: 18 },
    { id: 'r4', name: 'Kitchen', color: '#EF4444', requiredStaffRange: '1-2 (peak hours)', breakMinutes: '30 min per 6h', hourlyRate: 16 },
  ])
  const [roleModal, setRoleModal] = useState<{ open: boolean; mode: 'add' | 'edit'; role: WorkRole | null }>({ open: false, mode: 'add', role: null })
  const [roleDeleteId, setRoleDeleteId] = useState<string | null>(null)

  function openAddRole() {
    setRoleModal({ open: true, mode: 'add', role: null })
  }
  function openEditRole(role: WorkRole) {
    setRoleModal({ open: true, mode: 'edit', role })
  }
  function saveRole(role: WorkRole) {
    setWorkRoles(prev => {
      const exists = prev.find(r => r.id === role.id)
      if (exists) return prev.map(r => r.id === role.id ? role : r)
      return [...prev, role]
    })
  }
  function confirmDeleteRole() {
    if (roleDeleteId) {
      setWorkRoles(prev => prev.filter(r => r.id !== roleDeleteId))
      setRoleDeleteId(null)
    }
  }

  function toggleSection(key: string) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isCustom = activeTab !== 'org'
  const inheritable = activeTab !== 'org'
  const parentLabel = 'Organization'

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
          <h1 className="text-[22px] font-semibold text-[var(--color-text)]">Schedule Settings</h1>
          <p className="text-[12px] text-[var(--color-text-muted)]">Configure scheduling rules and thresholds</p>
        </div>
      </div>

      {/* Settings Registry hint */}
      <div className="flex items-start gap-2 px-4 py-3 mb-4 bg-[var(--color-info-muted)] rounded-xl text-[12px] text-[var(--color-info)]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mt-0.5 shrink-0"><circle cx="8" cy="8" r="6" /><line x1="8" y1="6" x2="8" y2="8" /><circle cx="8" cy="10.5" r="0.5" fill="currentColor" /></svg>
        <div>
          <div className="font-semibold mb-0.5">Settings Registry</div>
          <div className="leading-relaxed">
            Each setting declares which levels can override it (Org / Store / Individual). Settings inherit from parent unless overridden. Org may <strong>force-lock</strong> a setting to prevent any Store-level override.
          </div>
        </div>
      </div>

      {/* Level tabs */}
      <div className="flex gap-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-0.5 w-fit mb-5">
        {([['org', 'Organization'], ['main', 'Main Street'], ['downtown', 'Downtown']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${activeTab === key ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Settings sections */}
      <div className="space-y-3">
        <Section id="workHour" title="Work Hour Alerts" subtitle="Color thresholds for daily work hours" isCustom={isCustom} isExpanded={expanded.workHour} onToggle={() => toggleSection('workHour')} inheritable={inheritable} isInherited={inherited.workHour} onToggleInherit={() => toggleInherit('workHour')} parentLabel={parentLabel}>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[12px] font-medium text-[var(--color-success)] mb-1.5 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
                  Normal (Green)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[var(--color-text-secondary)]">Up to</span>
                  <input
                    type="number"
                    value={normalMax}
                    step="0.5"
                    onChange={e => handleNormalChange(e.target.value)}
                    className="w-20 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center"
                  />
                  <span className="text-[13px] text-[var(--color-text-secondary)]">hours</span>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-[var(--color-warning)] mb-1.5 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[var(--color-warning)]" />
                  Caution (Orange)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[var(--color-text-secondary)]">Up to</span>
                  <input
                    type="number"
                    value={cautionMax}
                    step="0.5"
                    onChange={e => handleCautionChange(e.target.value)}
                    className="w-20 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center"
                  />
                  <span className="text-[13px] text-[var(--color-text-secondary)]">hours</span>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-[var(--color-danger)] mb-1.5 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[var(--color-danger)]" />
                  Overtime (Red)
                </label>
                <div className="text-[13px] text-[var(--color-text-muted)] pt-2">Above {cautionMax} hours</div>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-[var(--color-text-muted)] mb-2">Preview</div>
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="bg-[var(--color-success)] transition-[width] duration-150" style={{ width: `${normalPct}%` }} />
                <div className="bg-[var(--color-warning)] transition-[width] duration-150" style={{ width: `${cautionPct}%` }} />
                <div className="bg-[var(--color-danger)] flex-1" />
              </div>
              <div className="relative h-4 mt-1">
                <span className="absolute left-0 text-[10px] text-[var(--color-text-muted)]" style={{ transform: 'translateX(0)' }}>0h</span>
                <span className="absolute text-[10px] text-[var(--color-text-muted)]" style={{ left: `${normalPct}%`, transform: 'translateX(-50%)' }}>{normalMax}h</span>
                <span className="absolute text-[10px] text-[var(--color-text-muted)]" style={{ left: `${normalPct + cautionPct}%`, transform: 'translateX(-50%)' }}>{cautionMax}h</span>
                <span className="absolute right-0 text-[10px] text-[var(--color-text-muted)]" style={{ transform: 'translateX(0)' }}>12h+</span>
              </div>
            </div>
            <Toggle label="Allow staff-level override" description="Individual staff can have custom thresholds" defaultChecked />
          </div>
        </Section>

        <Section id="weeklyLimits" title="Weekly Hour Limits" subtitle="Maximum hours and overtime thresholds" isCustom={isCustom} isExpanded={expanded.weeklyLimits} onToggle={() => toggleSection('weeklyLimits')} inheritable={inheritable} isInherited={inherited.weeklyLimits} onToggleInherit={() => toggleInherit('weeklyLimits')} parentLabel={parentLabel}>
          <div className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5 block">Max weekly hours</label>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue="40" className="w-20 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
                  <span className="text-[13px] text-[var(--color-text-muted)]">hours</span>
                </div>
                <EnforcementPill value={maxWeeklyMode} onChange={setMaxWeeklyMode} />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5 block">Overtime alert at</label>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue="30" className="w-20 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
                  <span className="text-[13px] text-[var(--color-text-muted)]">hours</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-warning-muted)] text-[var(--color-warning)]">
                  Warning only
                </span>
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5 block">Max consecutive days</label>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue="6" className="w-20 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
                  <span className="text-[13px] text-[var(--color-text-muted)]">days</span>
                </div>
                <EnforcementPill value={maxConsecMode} onChange={setMaxConsecMode} />
              </div>
            </div>
          </div>
        </Section>

        <Section id="approval" title="Approval Workflow" subtitle="Schedule approval requirements" locked={activeTab !== 'org'} isCustom={isCustom} isExpanded={expanded.approval} onToggle={() => toggleSection('approval')} parentLabel={parentLabel}>
          <div className="space-y-0 divide-y divide-[var(--color-border)]">
            <Toggle label="Require approval" description="Schedules need GM approval before confirming" defaultChecked locked={activeTab !== 'org'} />
            <Toggle label="Allow post-approval edit" description="GM can edit already approved schedules" defaultChecked locked={activeTab !== 'org'} />
            <Toggle label="Re-approve after edit" description="Edited schedules go back to pending" locked={activeTab !== 'org'} />
          </div>
        </Section>

        <Section id="breaks" title="Break Rules" subtitle="Paid break and meal break requirements" isCustom={isCustom} isExpanded={expanded.breaks} onToggle={() => toggleSection('breaks')} inheritable={inheritable} isInherited={inherited.breaks} onToggleInherit={() => toggleInherit('breaks')} parentLabel={parentLabel}>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5 block">Paid break every</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue="4" className="w-16 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
                <span className="text-[13px] text-[var(--color-text-muted)]">hours ×</span>
                <input type="number" defaultValue="10" className="w-16 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
                <span className="text-[13px] text-[var(--color-text-muted)]">min</span>
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5 block">Meal break required after</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue="5.5" step="0.5" className="w-16 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
                <span className="text-[13px] text-[var(--color-text-muted)]">hours ×</span>
                <input type="number" defaultValue="30" className="w-16 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
                <span className="text-[13px] text-[var(--color-text-muted)]">min</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">Premium pay if no break after</label>
              <input type="number" defaultValue="6" step="0.5" className="w-16 px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-[13px] text-center" />
              <span className="text-[13px] text-[var(--color-text-muted)]">hours</span>
            </div>
          </div>
          <div className="mt-3 divide-y divide-[var(--color-border)]">
            <Toggle label="Pre-break alert" description="Notify 30 min before scheduled break time" defaultChecked />
            <Toggle label="Late break alert" description="If break missed, notify before clock-out − break duration" defaultChecked />
          </div>
        </Section>

        <Section id="presets" title="Schedule Presets" subtitle="Default time ranges for shifts" isCustom={isCustom} isExpanded={expanded.presets} onToggle={() => toggleSection('presets')} inheritable={inheritable} isInherited={inherited.presets} onToggleInherit={() => toggleInherit('presets')} parentLabel={parentLabel}>
          <div className="space-y-2">
            {[
              { name: 'Open', start: '06:00', end: '14:00', color: 'var(--color-warning)' },
              { name: 'Morning', start: '08:00', end: '17:00', color: 'var(--color-accent)' },
              { name: 'Afternoon', start: '14:00', end: '22:00', color: 'var(--color-success)' },
              { name: 'Close', start: '16:00', end: '22:00', color: 'var(--color-info)' },
            ].map(shift => (
              <div key={shift.name} className="flex items-center gap-3 px-4 py-2.5 bg-[var(--color-bg)] rounded-lg">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: shift.color }} />
                <span className="text-[13px] font-semibold text-[var(--color-text)] w-24">{shift.name}</span>
                <input type="time" defaultValue={shift.start} className="px-2 py-1 border border-[var(--color-border)] rounded-md text-[12px] bg-white" />
                <span className="text-[var(--color-text-muted)]">–</span>
                <input type="time" defaultValue={shift.end} className="px-2 py-1 border border-[var(--color-border)] rounded-md text-[12px] bg-white" />
                <div className="ml-auto flex gap-1">
                  <button type="button" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1" aria-label="Edit"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 2.5l1.5 1.5L5 10.5H3.5V9z" /></svg></button>
                  <button type="button" className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1" aria-label="Delete"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 4h9M5 4V2.5h4V4M3.5 4l.5 8h6l.5-8" /></svg></button>
                </div>
              </div>
            ))}
            <button type="button" className="text-[12px] font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1 px-4 py-2">
              + Add Schedule Preset
            </button>
          </div>
        </Section>

        <Section id="workRoles" title="Work Roles" subtitle="Staffing requirements and defaults per role" isCustom={isCustom} isExpanded={expanded.workRoles} onToggle={() => toggleSection('workRoles')} inheritable={inheritable} isInherited={inherited.workRoles} onToggleInherit={() => toggleInherit('workRoles')} parentLabel={parentLabel}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workRoles.map(role => (
              <div key={role.id} className="border border-[var(--color-border)] rounded-lg p-3.5 bg-[var(--color-bg)]/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: role.color }} />
                    <span className="text-[13px] font-semibold text-[var(--color-text)]">{role.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => openEditRole(role)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1" aria-label="Edit role">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 2.5l1.5 1.5L5 10.5H3.5V9z" /></svg>
                    </button>
                    <button type="button" onClick={() => setRoleDeleteId(role.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1" aria-label="Delete role">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 4h9M5 4V2.5h4V4M3.5 4l.5 8h6l.5-8" /></svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Required staff</span>
                    <span className="text-[var(--color-text)] font-medium">{role.requiredStaffRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Default break</span>
                    <span className="text-[var(--color-text)] font-medium">{role.breakMinutes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Default rate</span>
                    <span className="text-[var(--color-text)] font-medium">${role.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={openAddRole} className="mt-3 text-[12px] font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1 px-2 py-2">
            + Add Work Role
          </button>
        </Section>
      </div>

      {/* Save */}
      <div className="flex justify-end mt-5 gap-3">
        <button type="button" onClick={onBack} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">Cancel</button>
        <button type="button" className="px-5 py-2 rounded-lg text-[13px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors">
          Save Changes
        </button>
      </div>

      {/* Work Role Modal */}
      <WorkRoleModal
        open={roleModal.open}
        mode={roleModal.mode}
        role={roleModal.role}
        onClose={() => setRoleModal({ open: false, mode: 'add', role: null })}
        onSave={saveRole}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={roleDeleteId !== null}
        title="Delete Work Role"
        message={`Are you sure you want to delete this work role? Staff currently assigned to it will need to be reassigned.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={confirmDeleteRole}
        onCancel={() => setRoleDeleteId(null)}
      />
    </div>
  )
}

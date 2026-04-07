import type React from 'react'

interface Props {
  activePage?: string
  onNavigate?: (pageId: string) => void
}

interface NavChild { id: string; label: string }
interface NavItem { id: string; label: string; icon?: string; children?: NavChild[]; badge?: number }

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    ]
  },
  {
    label: 'OPERATIONS',
    items: [
      { id: 'stores', label: 'Stores', icon: 'store' },
      { id: 'staff', label: 'Staff', icon: 'users' },
      {
        id: 'schedules', label: 'Schedules', icon: 'calendar',
        children: [
          { id: 'schedule-calendar', label: 'Calendar' },
          { id: 'schedule-settings', label: 'Settings' },
        ]
      },
      {
        id: 'attendance', label: 'Attendance', icon: 'clock',
        children: [
          { id: 'attendance-daily', label: 'Daily View' },
          { id: 'attendance-summary', label: 'Weekly Summary' },
        ]
      },
      {
        id: 'checklists', label: 'Checklists', icon: 'check',
        children: [
          { id: 'checklist-templates', label: 'Templates' },
          { id: 'checklist-progress', label: 'Progress' },
        ]
      },
      { id: 'tasks', label: 'Tasks', icon: 'zap' },
      { id: 'evaluations', label: 'Evaluations', icon: 'star' },
    ]
  },
  {
    label: 'COMMUNICATION',
    items: [
      { id: 'notices', label: 'Notices', icon: 'megaphone' },
      { id: 'reports', label: 'Daily Reports', icon: 'doc' },
      { id: 'alerts', label: 'Alerts', icon: 'bell', badge: 3 },
    ]
  },
  {
    label: 'ADMIN',
    items: [
      { id: 'inventory', label: 'Inventory', icon: 'box' },
      { id: 'settings', label: 'Settings', icon: 'gear' },
    ]
  },
]

const icons: Record<string, React.ReactElement> = {
  grid: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="5.5" height="5.5" rx="1"/><rect x="10.5" y="2" width="5.5" height="5.5" rx="1"/><rect x="2" y="10.5" width="5.5" height="5.5" rx="1"/><rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1"/></svg>,
  store: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2.5 9v6.5h13V9"/><path d="M1 4.5l1.5-2.5h13l1.5 2.5"/><line x1="1" y1="4.5" x2="17" y2="4.5"/></svg>,
  users: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 14v-1a2.5 2.5 0 00-2.5-2.5h-4A2.5 2.5 0 003 13v1"/><circle cx="7.5" cy="6" r="2.5"/><path d="M15 14v-1a2.5 2.5 0 00-1.5-2.3"/><path d="M11.5 3.7a2.5 2.5 0 010 4.6"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="14" height="13" rx="2"/><line x1="12" y1="1" x2="12" y2="5"/><line x1="6" y1="1" x2="6" y2="5"/><line x1="2" y1="7.5" x2="16" y2="7.5"/></svg>,
  clock: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="9" r="7"/><polyline points="9 5 9 9 11.5 10.5"/></svg>,
  check: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="14" height="14" rx="2"/><path d="M5.5 9l2.5 2.5L12.5 7"/></svg>,
  zap: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="10 1 3 10 9 10 8 17 15 8 9 8"/></svg>,
  star: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2l2 4.5 5 .5-3.5 3.5 1 5L9 13l-4.5 2.5 1-5L2 7l5-.5z"/></svg>,
  megaphone: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 4l-3.5 3.5H5a1 1 0 00-1 1v1a1 1 0 001 1h5.5L14 14V4z"/></svg>,
  doc: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10.5 2H5a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6.5z"/><polyline points="10.5 2 10.5 6.5 15 6.5"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M13 6.5a4 4 0 00-8 0c0 4.5-2 6-2 6h12s-2-1.5-2-6"/><path d="M10.2 15a1.2 1.2 0 01-2.4 0"/></svg>,
  box: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 9V5L9 1.5 3 5v4l6 3.5z"/><line x1="9" y1="9" x2="9" y2="16"/><line x1="3" y1="5" x2="9" y2="9"/><line x1="15" y1="5" x2="9" y2="9"/></svg>,
  gear: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="9" r="2.5"/><path d="M14.5 11a1.2 1.2 0 00.2 1.3l.1.1a1.4 1.4 0 11-2 2l-.1-.1a1.2 1.2 0 00-1.3-.2 1.2 1.2 0 00-.7 1.1v.2a1.4 1.4 0 11-2.8 0v-.1a1.2 1.2 0 00-.8-1.1 1.2 1.2 0 00-1.3.2l-.1.1a1.4 1.4 0 11-2-2l.1-.1a1.2 1.2 0 00.2-1.3 1.2 1.2 0 00-1.1-.7H2.6a1.4 1.4 0 110-2.8h.1a1.2 1.2 0 001.1-.8 1.2 1.2 0 00-.2-1.3l-.1-.1a1.4 1.4 0 112-2l.1.1a1.2 1.2 0 001.3.2h.1a1.2 1.2 0 00.7-1.1V2.6a1.4 1.4 0 112.8 0v.1a1.2 1.2 0 00.7 1.1 1.2 1.2 0 001.3-.2l.1-.1a1.4 1.4 0 112 2l-.1.1a1.2 1.2 0 00-.2 1.3v.1a1.2 1.2 0 001.1.7h.2a1.4 1.4 0 110 2.8h-.1a1.2 1.2 0 00-1.1.7z"/></svg>,
}

export function Sidebar({ activePage = 'schedule-calendar', onNavigate }: Props) {
  return (
    <aside className="fixed left-0 top-11 bottom-0 w-[220px] bg-white border-r border-[var(--color-border)] flex flex-col z-40 overflow-y-auto">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#6C5CE7"/>
            <path d="M8 10h12M8 14h7M8 18h9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <div>
            <div className="text-[13px] font-extrabold text-[var(--color-accent)]">TaskManager</div>
            <div className="text-[10px] text-[var(--color-text-muted)]">Admin Console</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2">
        {navSections.map(section => (
          <div key={section.label} className="mb-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              {section.label}
            </div>
            {section.items.map(item => {
              const isChildActive = item.children?.some(c => c.id === activePage) ?? false
              const isActive = item.id === activePage || isChildActive
              const isExpanded = isChildActive
              return (
                <div key={item.id}>
                  <a
                    onClick={() => !item.children && onNavigate?.(item.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
                      {icons[item.icon || '']}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-[var(--color-danger)] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {item.badge}
                      </span>
                    )}
                    {item.children && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                        className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                        <polyline points="4 5.5 7 8.5 10 5.5"/>
                      </svg>
                    )}
                  </a>
                  {item.children && isExpanded && (
                    <div className="ml-[30px] mt-0.5 mb-1 space-y-0.5">
                      {item.children.map(child => (
                        <a
                          key={child.id}
                          onClick={() => onNavigate?.(child.id)}
                          className={`block px-3 py-1.5 rounded-md text-[12px] font-medium cursor-pointer transition-colors ${
                            child.id === activePage
                              ? 'text-[var(--color-accent)] font-semibold'
                              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                          }`}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-[var(--color-border)] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] flex items-center justify-center text-[11px] font-bold shrink-0">
          JS
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-medium text-[var(--color-text)] truncate">John Smith</div>
          <div className="text-[10px] text-[var(--color-text-muted)] truncate">admin@company.com</div>
        </div>
      </div>
    </aside>
  )
}

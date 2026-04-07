import type { Staff, ScheduleBlock, Store, Attendance, ScheduleAuditEvent } from './types'

export const today = '2026-04-01'

export const stores: Store[] = [
  { id: 'main', name: 'Main Street', openHour: 6, closeHour: 22 },
  { id: 'downtown', name: 'Downtown', openHour: 7, closeHour: 23 },
  { id: 'westside', name: 'Westside', openHour: 6, closeHour: 21 },
]

export const staff: Staff[] = [
  { id: 's1', initials: 'SK', name: 'Sarah Kim', role: 'gm', hourlyRate: 25, position: 'Manager' },
  { id: 's2', initials: 'ML', name: 'Mike Lee', role: 'sv', hourlyRate: 20, position: 'Barista' },
  { id: 's3', initials: 'JP', name: 'James Park', role: 'staff', hourlyRate: 15, position: 'Server' },
  { id: 's4', initials: 'EC', name: 'Emily Chen', role: 'staff', hourlyRate: 15, position: 'Kitchen' },
  { id: 's5', initials: 'CH', name: 'Chris Han', role: 'staff', hourlyRate: 18, position: 'Barista' },
  { id: 's6', initials: 'AY', name: 'Alex Yun', role: 'staff', hourlyRate: null, position: 'Server' },
]

// Helper to build schedule with snapshot fields
function makeSchedule(s: Partial<ScheduleBlock> & {
  id: string; staffId: string; storeId: string; date: string;
  startHour: number; endHour: number; shift: string; status: ScheduleBlock['status'];
}): ScheduleBlock {
  const st = staff.find(x => x.id === s.staffId)
  const workRoleId = `wr-${s.shift.toLowerCase()}`
  return {
    workRoleId,
    workRoleNameSnapshot: s.shift,
    positionSnapshot: st?.position || '',
    hourlyRateSnapshot: st?.hourlyRate ?? undefined,
    createdBy: 's2',
    createdByRole: 'sv',
    createdAt: '2026-03-25T10:00:00Z',
    ...s,
  } as ScheduleBlock
}

// Week: Sun Mar 29 – Sat Apr 4, 2026
export const schedules: ScheduleBlock[] = [
  // Sarah Kim (GM)
  makeSchedule({ id: 'sch-1', staffId: 's1', storeId: 'main', date: '2026-03-30', startHour: 8, endHour: 17, shift: 'Morning', status: 'confirmed' }),
  makeSchedule({ id: 'sch-2', staffId: 's1', storeId: 'downtown', date: '2026-03-31', startHour: 8, endHour: 14, shift: 'Day', status: 'confirmed', isOtherStore: true, otherStoreName: 'Downtown' }),
  makeSchedule({ id: 'sch-3', staffId: 's1', storeId: 'main', date: '2026-04-01', startHour: 8, endHour: 17, shift: 'Day', status: 'confirmed' }),
  makeSchedule({ id: 'sch-4', staffId: 's1', storeId: 'main', date: '2026-04-02', startHour: 8, endHour: 17, shift: 'Day', status: 'confirmed' }),

  // Mike Lee (SV)
  makeSchedule({ id: 'sch-5', staffId: 's2', storeId: 'main', date: '2026-03-30', startHour: 13, endHour: 22, shift: 'Afternoon', status: 'confirmed' }),
  makeSchedule({ id: 'sch-6', staffId: 's2', storeId: 'main', date: '2026-03-31', startHour: 8, endHour: 17, shift: 'Day', status: 'requested' }),
  makeSchedule({ id: 'sch-7', staffId: 's2', storeId: 'main', date: '2026-04-03', startHour: 8, endHour: 17, shift: 'Day', status: 'confirmed' }),

  // James Park (Staff)
  makeSchedule({ id: 'sch-8', staffId: 's3', storeId: 'main', date: '2026-03-31', startHour: 8, endHour: 13, shift: 'Day', status: 'confirmed' }),
  makeSchedule({ id: 'sch-9', staffId: 's3', storeId: 'main', date: '2026-04-01', startHour: 6, endHour: 14, shift: 'Open', status: 'requested' }),
  makeSchedule({ id: 'sch-10', staffId: 's3', storeId: 'main', date: '2026-04-03', startHour: 13, endHour: 22, shift: 'Afternoon', status: 'confirmed' }),
  makeSchedule({ id: 'sch-11', staffId: 's3', storeId: 'main', date: '2026-04-04', startHour: 6, endHour: 11, shift: 'Open', status: 'confirmed' }),
  makeSchedule({ id: 'sch-12', staffId: 's3', storeId: 'main', date: '2026-04-04', startHour: 14, endHour: 18, shift: 'Afternoon', status: 'confirmed' }),

  // Emily Chen (Staff)
  makeSchedule({ id: 'sch-13', staffId: 's4', storeId: 'main', date: '2026-03-30', startHour: 6, endHour: 11, shift: 'Open', status: 'requested' }),
  makeSchedule({ id: 'sch-14', staffId: 's4', storeId: 'main', date: '2026-04-01', startHour: 10, endHour: 15, shift: 'Day', status: 'confirmed' }),
  makeSchedule({ id: 'sch-15', staffId: 's4', storeId: 'main', date: '2026-04-02', startHour: 6, endHour: 11, shift: 'Open', status: 'confirmed' }),
  makeSchedule({ id: 'sch-16', staffId: 's4', storeId: 'westside', date: '2026-04-03', startHour: 10, endHour: 15, shift: 'Day', status: 'confirmed', isOtherStore: true, otherStoreName: 'Westside' }),
  makeSchedule({ id: 'sch-17', staffId: 's4', storeId: 'main', date: '2026-03-29', startHour: 8, endHour: 13, shift: 'Morning', status: 'confirmed' }),

  // Chris Han (Staff)
  makeSchedule({ id: 'sch-18', staffId: 's5', storeId: 'main', date: '2026-03-31', startHour: 14, endHour: 19, shift: 'Afternoon', status: 'confirmed' }),
  makeSchedule({ id: 'sch-19', staffId: 's5', storeId: 'main', date: '2026-04-02', startHour: 16, endHour: 22, shift: 'Close', status: 'requested' }),
  makeSchedule({ id: 'sch-20', staffId: 's5', storeId: 'main', date: '2026-04-03', startHour: 14, endHour: 19, shift: 'Afternoon', status: 'confirmed' }),
  // Cancelled — Mike Lee Sat 4/4 (replaces sch-21 cancelled demo). Original Chris Han close moved.
  makeSchedule({
    id: 'sch-21', staffId: 's5', storeId: 'main', date: '2026-04-04', startHour: 15, endHour: 22, shift: 'Close', status: 'cancelled',
    cancelledBy: 's1', cancelledAt: '2026-04-02T14:30:00Z', cancellationReason: 'Staff requested time off — approved by GM',
  }),

  // Alex Yun (Staff — NO RATE)
  makeSchedule({ id: 'sch-22', staffId: 's6', storeId: 'main', date: '2026-03-29', startHour: 8, endHour: 17, shift: 'Day', status: 'draft' }),
  // Rejected — Alex Yun Tue 3/31 (no hourly rate)
  makeSchedule({
    id: 'sch-23', staffId: 's6', storeId: 'main', date: '2026-03-31', startHour: 9, endHour: 14, shift: 'Day', status: 'rejected',
    rejectedBy: 's1', rejectedAt: '2026-03-26T16:00:00Z', rejectionReason: 'No hourly rate set for this staff member',
  }),
  // A second cancelled example — Mike Lee earlier in the week
  makeSchedule({
    id: 'sch-24', staffId: 's2', storeId: 'main', date: '2026-04-04', startHour: 9, endHour: 15, shift: 'Day', status: 'cancelled',
    cancelledBy: 's1', cancelledAt: '2026-04-02T11:00:00Z', cancellationReason: 'Coverage no longer needed',
  }),
  // A second rejected example — Chris Han earlier draft rejected
  makeSchedule({
    id: 'sch-25', staffId: 's5', storeId: 'main', date: '2026-03-29', startHour: 9, endHour: 17, shift: 'Day', status: 'rejected',
    rejectedBy: 's1', rejectedAt: '2026-03-26T09:00:00Z', rejectionReason: 'Conflicts with existing schedule',
  }),
]

// Today is Wed Apr 1, 2026 (within visible week Mar 29 - Apr 4)
export const attendances: Attendance[] = [
  // ===== PAST DAYS =====
  // Mon 3/30 — completed shifts
  { id: 'a1', scheduleId: 'sch-1', staffId: 's1', date: '2026-03-30',
    state: 'clocked_out', clockIn: '07:58', clockOut: '17:02',
    breaks: [{ start: '12:00', end: '12:30', paid: false }],
    actualMinutes: 514, actualCost: 214, anomalies: [] },
  { id: 'a2', scheduleId: 'sch-5', staffId: 's2', date: '2026-03-30',
    state: 'clocked_out', clockIn: '13:08', clockOut: '22:05',
    breaks: [{ start: '17:00', end: '17:30', paid: false }],
    actualMinutes: 507, actualCost: 169, anomalies: ['late'] },
  { id: 'a3', scheduleId: 'sch-13', staffId: 's4', date: '2026-03-30',
    state: 'no_show', breaks: [], anomalies: ['no_show'] },

  // Tue 3/31 — completed shifts
  { id: 'a4', scheduleId: 'sch-8', staffId: 's3', date: '2026-03-31',
    state: 'clocked_out', clockIn: '08:00', clockOut: '13:00',
    breaks: [], actualMinutes: 300, actualCost: 75, anomalies: [] },
  { id: 'a5', scheduleId: 'sch-18', staffId: 's5', date: '2026-03-31',
    state: 'clocked_out', clockIn: '14:05', clockOut: '19:00',
    breaks: [], actualMinutes: 295, actualCost: 88, anomalies: [] },

  // ===== TODAY (Wed Apr 1) — live states =====
  { id: 'a6', scheduleId: 'sch-3', staffId: 's1', date: '2026-04-01',
    state: 'working', clockIn: '07:58',
    breaks: [], anomalies: [] }, // Sarah Kim — currently working
  { id: 'a7', scheduleId: 'sch-9', staffId: 's3', date: '2026-04-01',
    state: 'late', clockIn: '06:23',
    breaks: [], anomalies: ['late'] }, // James Park — clocked in late
  { id: 'a8', scheduleId: 'sch-14', staffId: 's4', date: '2026-04-01',
    state: 'on_break', clockIn: '10:02',
    breaks: [{ start: '12:30', end: '13:00', paid: false }], anomalies: [] }, // Emily Chen — on break

  // ===== FUTURE DAYS =====
  // Thu 4/2 — not yet started
  { id: 'a9', scheduleId: 'sch-4', staffId: 's1', date: '2026-04-02',
    state: 'not_yet', breaks: [], anomalies: [] }, // Sarah Kim
  { id: 'a10', scheduleId: 'sch-15', staffId: 's4', date: '2026-04-02',
    state: 'not_yet', breaks: [], anomalies: [] }, // Emily Chen
  { id: 'a11', scheduleId: 'sch-19', staffId: 's5', date: '2026-04-02',
    state: 'not_yet', breaks: [], anomalies: [] }, // Chris Han (pending)

  // Fri 4/3
  { id: 'a12', scheduleId: 'sch-7', staffId: 's2', date: '2026-04-03',
    state: 'not_yet', breaks: [], anomalies: [] }, // Mike Lee
  { id: 'a13', scheduleId: 'sch-10', staffId: 's3', date: '2026-04-03',
    state: 'not_yet', breaks: [], anomalies: [] }, // James Park
  { id: 'a14', scheduleId: 'sch-20', staffId: 's5', date: '2026-04-03',
    state: 'not_yet', breaks: [], anomalies: [] }, // Chris Han

  // Sat 4/4
  { id: 'a15', scheduleId: 'sch-11', staffId: 's3', date: '2026-04-04',
    state: 'not_yet', breaks: [], anomalies: [] },
  { id: 'a16', scheduleId: 'sch-21', staffId: 's5', date: '2026-04-04',
    state: 'not_yet', breaks: [], anomalies: [] },
]

export function getAttendance(scheduleId: string): Attendance | undefined {
  return attendances.find(a => a.scheduleId === scheduleId)
}

export function getAttendancesByDate(date: string): Attendance[] {
  return attendances.filter(a => a.date === date)
}

// Week dates (Sunday first)
export const weekDates = [
  { date: '2026-03-29', dayName: 'SUN', dayNum: 'Mar 29', isWeekend: true, isSunday: true },
  { date: '2026-03-30', dayName: 'MON', dayNum: 'Mar 30', isWeekend: false, isSunday: false },
  { date: '2026-03-31', dayName: 'TUE', dayNum: 'Mar 31', isWeekend: false, isSunday: false },
  { date: '2026-04-01', dayName: 'WED', dayNum: 'Apr 1', isWeekend: false, isSunday: false },
  { date: '2026-04-02', dayName: 'THU', dayNum: 'Apr 2', isWeekend: false, isSunday: false },
  { date: '2026-04-03', dayName: 'FRI', dayNum: 'Apr 3', isWeekend: false, isSunday: false },
  { date: '2026-04-04', dayName: 'SAT', dayNum: 'Apr 4', isWeekend: true, isSunday: false },
]

export const roleColors: Record<string, string> = {
  owner: 'bg-red-100 text-red-600',
  gm: 'bg-purple-100 text-purple-600',
  sv: 'bg-amber-100 text-amber-600',
  staff: 'bg-gray-100 text-gray-500',
}

// Audit log events (Schedule history)
export const auditEvents: ScheduleAuditEvent[] = [
  // sch-1 — Sarah Kim Mon 3/30 confirmed
  { id: 'e1', scheduleId: 'sch-1', eventType: 'created', actorId: 's2', actorName: 'Mike Lee', actorRole: 'sv', timestamp: '2026-03-25T10:00:00Z', description: 'Created draft' },
  { id: 'e2', scheduleId: 'sch-1', eventType: 'requested', actorId: 's2', actorName: 'Mike Lee', actorRole: 'sv', timestamp: '2026-03-25T10:05:00Z', description: 'Submitted for review' },
  { id: 'e3', scheduleId: 'sch-1', eventType: 'confirmed', actorId: 's1', actorName: 'Sarah Kim', actorRole: 'gm', timestamp: '2026-03-25T15:30:00Z', description: 'Confirmed schedule' },

  // sch-6 — Mike Lee Tue 3/31 requested
  { id: 'e4', scheduleId: 'sch-6', eventType: 'created', actorId: 's2', actorName: 'Mike Lee', actorRole: 'sv', timestamp: '2026-03-26T09:00:00Z', description: 'Created draft' },
  { id: 'e5', scheduleId: 'sch-6', eventType: 'requested', actorId: 's2', actorName: 'Mike Lee', actorRole: 'sv', timestamp: '2026-03-26T09:15:00Z', description: 'Submitted for review' },

  // sch-21 — Chris Han Sat 4/4 cancelled
  { id: 'e6', scheduleId: 'sch-21', eventType: 'created', actorId: 's2', actorName: 'Mike Lee', actorRole: 'sv', timestamp: '2026-03-25T11:00:00Z', description: 'Created draft' },
  { id: 'e7', scheduleId: 'sch-21', eventType: 'confirmed', actorId: 's1', actorName: 'Sarah Kim', actorRole: 'gm', timestamp: '2026-03-25T16:00:00Z', description: 'Confirmed schedule' },
  { id: 'e8', scheduleId: 'sch-21', eventType: 'cancelled', actorId: 's1', actorName: 'Sarah Kim', actorRole: 'gm', timestamp: '2026-04-02T14:30:00Z', description: 'Cancelled confirmed schedule', reason: 'Staff requested time off — approved by GM' },

  // sch-23 — Alex Yun Tue 3/31 rejected
  { id: 'e9', scheduleId: 'sch-23', eventType: 'created', actorId: 's2', actorName: 'Mike Lee', actorRole: 'sv', timestamp: '2026-03-26T08:30:00Z', description: 'Created draft' },
  { id: 'e10', scheduleId: 'sch-23', eventType: 'requested', actorId: 's2', actorName: 'Mike Lee', actorRole: 'sv', timestamp: '2026-03-26T08:35:00Z', description: 'Submitted for review' },
  { id: 'e11', scheduleId: 'sch-23', eventType: 'rejected', actorId: 's1', actorName: 'Sarah Kim', actorRole: 'gm', timestamp: '2026-03-26T16:00:00Z', description: 'Rejected schedule', reason: 'No hourly rate set for this staff member' },
]

export function getAuditEvents(scheduleId: string): ScheduleAuditEvent[] {
  return auditEvents
    .filter(e => e.scheduleId === scheduleId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export const roleLabels: Record<string, string> = {
  owner: 'OWNER',
  gm: 'GM',
  sv: 'SV',
  staff: 'STAFF',
}

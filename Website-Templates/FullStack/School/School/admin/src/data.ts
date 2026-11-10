import type { AttendanceStudent, FeeRecord, PinRecord } from './types'

export const initialFees: FeeRecord[] = [
  { id: 'GF-2501', student: 'Adaeze Okafor', className: 'JSS 3 Gold', amount: 125000, paid: 125000, status: 'Paid' },
  { id: 'GF-2502', student: 'Tunde Bakare', className: 'JSS 3 Gold', amount: 125000, paid: 85000, status: 'Partial' },
  { id: 'GF-2503', student: 'Fatima Musa', className: 'JSS 2 Blue', amount: 125000, paid: 125000, status: 'Paid' },
  { id: 'GF-2504', student: 'Emeka Obi', className: 'JSS 3 Gold', amount: 125000, paid: 0, status: 'Unpaid' },
  { id: 'GF-2505', student: 'Zainab Ali', className: 'SS 1 Gold', amount: 145000, paid: 98000, status: 'Partial' },
  { id: 'GF-2506', student: 'Chidi Eze', className: 'SS 2 Green', amount: 145000, paid: 145000, status: 'Paid' },
]

export const initialAttendance: AttendanceStudent[] = [
  { id: 'a1', name: 'Adaeze Okafor', className: 'JSS 3 Gold', present: true },
  { id: 'a2', name: 'Tunde Bakare', className: 'JSS 3 Gold', present: true },
  { id: 'a3', name: 'Fatima Musa', className: 'JSS 3 Gold', present: true },
  { id: 'a4', name: 'Emeka Obi', className: 'JSS 3 Gold', present: false },
  { id: 'a5', name: 'Zainab Ali', className: 'SS 1 Gold', present: true },
]

export const initialPins: PinRecord[] = [
  { pin: '•••• •••• 4218', className: 'JSS 3 Gold', assignedTo: 'Adaeze Okafor', status: 'Used', created: '28 Oct, 09:14' },
  { pin: '•••• •••• 7732', className: 'JSS 3 Gold', assignedTo: 'Unassigned', status: 'Active', created: '28 Oct, 09:14' },
  { pin: '•••• •••• 1905', className: 'SS 1 Gold', assignedTo: 'Tunde Bakare', status: 'Used', created: '27 Oct, 15:48' },
]

export const students = [
  ['Adaeze Okafor', 'GF-2501', 'JSS 3 Gold', 'Active'],
  ['Tunde Bakare', 'GF-2502', 'JSS 3 Gold', 'Active'],
  ['Fatima Musa', 'GF-2503', 'JSS 2 Blue', 'Active'],
  ['Emeka Obi', 'GF-2504', 'JSS 3 Gold', 'Review'],
  ['Zainab Ali', 'GF-2505', 'SS 1 Gold', 'Active'],
  ['Chidi Eze', 'GF-2506', 'SS 2 Green', 'Active'],
]

export const money = (value: number) => `₦${value.toLocaleString('en-NG')}`

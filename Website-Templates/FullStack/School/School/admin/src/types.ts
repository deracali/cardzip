export type AdminPath = '/' | '/students' | '/fees' | '/results' | '/attendance' | '/pins' | '/broadcast' | '/settings' | '/login'
export type FeeRecord = { id: string; student: string; className: string; amount: number; paid: number; status: 'Paid' | 'Partial' | 'Unpaid' }
export type AttendanceStudent = { id: string; name: string; className: string; present: boolean }
export type PinRecord = { pin: string; className: string; assignedTo: string; status: 'Active' | 'Used'; created: string }

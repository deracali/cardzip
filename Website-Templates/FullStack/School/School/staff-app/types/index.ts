export type StaffTab = 'Home' | 'Attendance' | 'Results' | 'More'
export type AttendanceRecord = { id: string; name: string; className: string; present: boolean }
export type StaffState = { signedIn: boolean; attendance: AttendanceRecord[]; attendanceSubmitted: boolean; resultsPublished: boolean }

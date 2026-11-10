import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AttendanceRecord, StaffState } from '../types'

const KEY = 'greenfield.staff.demo-state'
const roster: AttendanceRecord[] = [
  { id: '1', name: 'Adaeze Okafor', className: 'JSS 3 Gold', present: true },
  { id: '2', name: 'Tunde Bakare', className: 'JSS 3 Gold', present: true },
  { id: '3', name: 'Fatima Musa', className: 'JSS 3 Gold', present: true },
  { id: '4', name: 'Emeka Obi', className: 'JSS 3 Gold', present: false },
  { id: '5', name: 'Zainab Ali', className: 'JSS 3 Gold', present: true },
]
const initial: StaffState = { signedIn: true, attendance: roster, attendanceSubmitted: false, resultsPublished: false }

export function useStaffState() {
  const [state, setState] = useState(initial)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((value) => {
      if (value) setState({ ...initial, ...JSON.parse(value) as Partial<StaffState> })
      setReady(true)
    }).catch((error: unknown) => {
      console.error('Unable to load staff demo state', error)
      setReady(true)
    })
  }, [])
  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch((error: unknown) => console.error('Unable to save staff demo state', error))
  }, [ready, state])
  const toggleAttendance = (id: string) => setState((current) => ({ ...current, attendanceSubmitted: false, attendance: current.attendance.map((record) => record.id === id ? { ...record, present: !record.present } : record) }))
  return {
    state,
    toggleAttendance,
    submitAttendance: () => setState((current) => ({ ...current, attendanceSubmitted: true })),
    publishResults: () => setState((current) => ({ ...current, resultsPublished: true })),
    signIn: () => setState((current) => ({ ...current, signedIn: true })),
    signOut: () => setState((current) => ({ ...current, signedIn: false })),
  }
}

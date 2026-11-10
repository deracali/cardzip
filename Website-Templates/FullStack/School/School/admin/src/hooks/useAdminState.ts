import { useEffect, useState } from 'react'
import { initialAttendance, initialFees, initialPins } from '../data'
import type { AttendanceStudent, FeeRecord, PinRecord } from '../types'

export type AdminState = { fees: FeeRecord[]; attendance: AttendanceStudent[]; pins: PinRecord[] }
const key = 'greenfield.admin.demo-state'

export function useAdminState() {
  const [state, setState] = useState<AdminState>({ fees: initialFees, attendance: initialAttendance, pins: initialPins })
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) setState({ ...state, ...JSON.parse(saved) as Partial<AdminState> })
    } catch (error) {
      console.error('Unable to load admin demo state', error)
    } finally {
      setReady(true)
    }
  // Initial values are read only once during initialization.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(key, JSON.stringify(state)) }
    catch (error) { console.error('Unable to save admin demo state', error) }
  }, [ready, state])
  return {
    state,
    toggleAttendance: (id: string) => setState((current) => ({ ...current, attendance: current.attendance.map((row) => row.id === id ? { ...row, present: !row.present } : row) })),
    markPaid: (id: string) => setState((current) => ({ ...current, fees: current.fees.map((row) => row.id === id ? { ...row, paid: row.amount, status: 'Paid' } : row) })),
    addPins: (count: number, className: string) => setState((current) => {
      const created = new Date().toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      const generated = Array.from({ length: count }, (_, index): PinRecord => ({ pin: `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`, className, assignedTo: 'Unassigned', status: 'Active', created: `${created} · ${index + 1}` }))
      return { ...current, pins: [...generated, ...current.pins] }
    }),
  }
}

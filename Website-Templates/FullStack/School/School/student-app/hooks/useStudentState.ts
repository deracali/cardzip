import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PaymentMethod, StudentState } from '../types'

const STORAGE_KEY = 'greenfield.student.demo-state'
const initialState: StudentState = { signedIn: true, feesPaid: false, paymentMethod: 'Card' }

export function useStudentState() {
  const [state, setState] = useState(initialState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value) setState({ ...initialState, ...JSON.parse(value) as Partial<StudentState> })
      setReady(true)
    }).catch((error: unknown) => {
      console.error('Unable to load student demo state', error)
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((error: unknown) => {
      console.error('Unable to save student demo state', error)
    })
  }, [ready, state])

  return {
    state,
    setPaymentMethod: (paymentMethod: PaymentMethod) => setState((current) => ({ ...current, paymentMethod })),
    payFees: () => setState((current) => ({ ...current, feesPaid: true })),
    signOut: () => setState((current) => ({ ...current, signedIn: false })),
    signIn: () => setState((current) => ({ ...current, signedIn: true })),
  }
}

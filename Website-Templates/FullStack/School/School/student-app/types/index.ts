export type StudentTab = 'Home' | 'Fees' | 'Results' | 'More' | 'Timetable' | 'Notices' | 'Profile' | 'Help'
export type PaymentMethod = 'Card' | 'Bank transfer' | 'Wallet'

export type Assignment = {
  id: string
  subject: string
  title: string
  due: string
  state: 'Pending' | 'Submitted' | 'Graded'
}

export type StudentState = {
  signedIn: boolean
  feesPaid: boolean
  paymentMethod: PaymentMethod
}

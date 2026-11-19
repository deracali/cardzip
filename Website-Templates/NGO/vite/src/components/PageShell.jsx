import Footer from './Footer'
import Header from './Header'

export default function PageShell({ children }) {
  return <><Header />{children}<Footer /></>
}

import Footer from './Footer'
import Header from './Header'

export default function PageShell({ children, footer = true }) {
  return <><Header />{children}{footer && <Footer />}</>
}

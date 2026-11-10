import { useEffect } from 'react'
import { SiteLayout } from './components/SiteLayout'
import { HomePage } from './pages/HomePage'
import { InfoPage } from './pages/InfoPage'
import { AdmissionsPage } from './pages/AdmissionsPage'
import { ContactPage } from './pages/ContactPage'
import { PortalPage } from './pages/PortalPage'
import { StudentAccessPage } from './pages/StudentAccessPage'

const titles: Record<string, string> = {
  '/': 'Home', '/about': 'About our school', '/academics': 'Academics',
  '/campus-life': 'Campus life', '/admissions': 'Admissions', '/contact': 'Contact',
  '/portal': 'School portal', '/student-app': 'Student app', '/privacy': 'Privacy',
}

function PrivacyPage() {
  return <main className="subpage"><section className="subpage-hero"><span className="eyebrow">PRIVACY</span><h1>Your family's trust matters.</h1><p>This website preview stores no personal information on a server and does not send form submissions.</p></section><div className="info-callout"><p>Before a live school service launches, Greenfield College should publish its approved privacy notice and contact information.</p><a className="button button-navy" href="/contact">Contact the school</a></div></main>
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  useEffect(() => { document.title = `Greenfield College | ${titles[path] ?? 'Page not found'}` }, [path])
  let page
  if (path === '/') page = <HomePage />
  else if (path === '/about' || path === '/academics' || path === '/campus-life') page = <InfoPage page={path.slice(1) as 'about' | 'academics' | 'campus-life'} />
  else if (path === '/admissions') page = <AdmissionsPage />
  else if (path === '/contact') page = <ContactPage />
  else if (path === '/portal') page = <PortalPage />
  else if (path === '/student-app') page = <StudentAccessPage />
  else if (path === '/privacy') page = <PrivacyPage />
  else page = <main className="subpage not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>That page isn't here.</h1><p>Use the links below to continue exploring Greenfield College.</p><a className="button button-navy" href="/">Return home <ArrowRight size={16}/></a></main>
  return <SiteLayout>{page}</SiteLayout>
}

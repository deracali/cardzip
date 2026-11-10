import { ArrowLeft, BookOpen, Smartphone } from 'lucide-react'

export function StudentAccessPage() {
  return <main className="portal-page"><article className="portal-card"><span className="portal-logo"><Smartphone size={22}/></span><span className="eyebrow">STUDENT PORTAL · EXPO APP</span><h1>Your school, in your pocket.</h1><p>The student experience is a separate native app with fees, results, attendance updates, timetable, and school notices.</p><div className="info-callout"><BookOpen size={17}/><p>To preview the mobile app, run <b>npm run start:student</b> from the School project folder and open it with Expo Go.</p></div><a className="text-link" href="/portal"><ArrowLeft size={15}/> Back to portal options</a></article></main>
}

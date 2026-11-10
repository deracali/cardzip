import { useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export function AdmissionsPage() {
  const [sent, setSent] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(true)
  }
  return <main className="subpage admissions-page"><section className="subpage-hero"><span className="eyebrow">ADMISSIONS · 2026/27</span><h1>Start a conversation.<br /><em>Open a world of possibility.</em></h1><p>Tell us a little about your family and our admissions team will help you plan a campus visit.</p></section><div className="admissions-layout"><section className="admissions-steps"><h2>Your next steps</h2>{['Share your details', 'Visit the campus', 'Complete an application', 'Meet your learning community'].map((step, index) => <p key={step}><span>0{index + 1}</span><b>{step}</b></p>)}</section><form className="admissions-form" onSubmit={submit}><h2>Request information</h2><label>Parent or guardian name<input required autoComplete="name" placeholder="Your name" /></label><label>Email address<input required type="email" autoComplete="email" placeholder="you@example.com" /></label><label>Student year group<select defaultValue=""><option value="" disabled>Select a year group</option><option>Junior secondary</option><option>Senior secondary</option></select></label><label>Anything you'd like us to know?<textarea rows={3} placeholder="Optional" /></label><button className="button button-navy">Send inquiry <ArrowRight size={15}/></button>{sent&&<p className="success-message" role="status"><CheckCircle2 size={17}/> Thank you. Your inquiry is saved in this demo.</p>}<small>This preview does not send your information to the school.</small></form></div></main>
}

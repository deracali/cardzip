import { useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'

export function ContactPage() {
  const [sent, setSent] = useState(false)
  return <main className="subpage contact-page"><section className="subpage-hero"><span className="eyebrow">GET IN TOUCH</span><h1>We'd love to hear from you.</h1><p>Our school office can help with visits, admissions, and general questions.</p></section><div className="contact-layout"><div className="contact-details"><p><MapPin/><span><b>Visit</b>14 College Road, Ikeja, Lagos</span></p><p><Phone/><span><b>Call</b><a href="tel:+2348000000000">+234 800 000 0000</a></span></p><p><Mail/><span><b>Email</b><a href="mailto:hello@greenfield.example">hello@greenfield.example</a></span></p></div><form className="admissions-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true) }}><label>Your name<input required autoComplete="name" /></label><label>Email address<input required type="email" autoComplete="email" /></label><label>Message<textarea rows={4} required /></label><button className="button button-navy">Send message <ArrowRight size={15}/></button>{sent&&<p className="success-message" role="status"><CheckCircle2 size={17}/> Message saved in this demo.</p>}</form></div></main>
}

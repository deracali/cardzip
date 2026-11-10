'use client';

import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  Database,
  FileText,
  Fingerprint,
  GitBranch,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Play,
  Plug,
  Radio,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import { Logo, Footer, DashboardPreview, SectionHeading, FeatureCards, FAQSection } from '../components/Shared';

export default function FormPage({ mode }: { mode: 'signup' | 'login' | 'contact' }) {
  const [submitted, setSubmitted] = useState(false)
  const isContact = mode === 'contact'
  const isLogin = mode === 'login'
  const title = isContact ? 'Let’s talk about your team.' : isLogin ? 'Welcome back.' : 'Your next workflow starts here.'
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }
  return <><main className="form-page"><div className="form-card"><Logo /><span className="eyebrow">{isContact ? 'CONTACT SALES' : isLogin ? 'YOUR WORKSPACE' : 'FREE 14-DAY PRO TRIAL'}</span><h1>{title}</h1><p>{isContact ? 'Tell us a little about what you need and our team will be in touch.' : isLogin ? 'Log in to continue to your Nexara workspace.' : 'No credit card required. Get started in less than a minute.'}</p>{submitted ? <div className="form-success"><Check size={20} /><div><b>{isContact ? 'Thanks for reaching out.' : isLogin ? 'Login preview complete.' : 'You’re on your way.'}</b><span>{isContact ? 'This demo form does not send messages. Connect a form service to receive inquiries.' : 'This is a front-end preview. Connect your authentication service to enable accounts.'}</span></div></div> : <form onSubmit={submit}>{!isLogin && <label>{isContact ? 'Your name' : 'Name'}<input required autoComplete="name" placeholder="Alex Morgan" /></label>}<label>Work email<input required type="email" autoComplete="email" placeholder="you@company.com" /></label>{isContact ? <><label>Company<input required autoComplete="organization" placeholder="Your company" /></label><label>What can we help with?<textarea required rows={4} placeholder="Tell us about your team and goals..." /></label></> : isLogin ? <label>Password<input required type="password" autoComplete="current-password" minLength={8} placeholder="At least 8 characters" /></label> : <label>Create a password<input required type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" /></label>}<button className="button form-submit" type="submit">{isContact ? 'Send inquiry' : isLogin ? 'Log in' : 'Create free account'} <ArrowRight size={15} /></button></form>}{!isContact && <p className="form-switch">{isLogin ? 'New to Nexara?' : 'Already have an account?'} <a href={isLogin ? '/signup' : '/login'}>{isLogin ? 'Start free' : 'Log in'}</a></p>}{isContact && <a className="back-link" href="/">Back to home</a>}</div></main><Footer /></>
}

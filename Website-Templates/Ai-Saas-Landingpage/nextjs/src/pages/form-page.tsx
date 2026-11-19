'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Footer, Logo } from '../components/Shared';
import { getUserToken, nexaraApi, setUserToken } from '../services/nexara-api';

export default function FormPage({ mode }: { mode: 'signup' | 'login' | 'contact' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isContact = mode === 'contact';
  const isLogin = mode === 'login';
  const title = isContact ? 'Let’s talk about your team.' : isLogin ? 'Welcome back.' : 'Your next workflow starts here.';

  useEffect(() => {
    setIsAuthenticated(Boolean(getUserToken()));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isContact) {
        await nexaraApi.submitLead({ type: 'contact', name, email, company, message }, getUserToken());
        setSubmitted(true);
        return;
      }

      const result = isLogin
        ? await nexaraApi.login({ email, password })
        : await nexaraApi.signUp({ name, email, password });
      setUserToken(result.token);
      window.location.assign('/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'We could not submit your request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return <><main className="form-page"><div className="form-card"><Logo /><span className="eyebrow">{isContact ? 'CONTACT SALES' : isLogin ? 'YOUR WORKSPACE' : 'FREE 14-DAY PRO TRIAL'}</span><h1>{title}</h1><p>{isContact ? 'Tell us a little about what you need and our team will be in touch.' : isLogin ? 'Log in to continue to your Nexara workspace.' : 'No credit card required. Get started in less than a minute.'}</p>{isContact && !isAuthenticated && <p className="form-switch">Already have an account? <a href="/login">Sign in first to track this inquiry in your dashboard</a>.</p>}{submitted ? <div className="form-success"><Check size={20} /><div><b>Thanks for reaching out.</b><span>{isAuthenticated ? 'Your inquiry has been saved to your client dashboard. Replies from our team will appear there.' : 'Your inquiry has been saved. To see replies in your client dashboard, sign in before sending future inquiries.'}</span></div></div> : <form onSubmit={submit}>{!isLogin && <label>{isContact ? 'Your name' : 'Name'}<input required autoComplete="name" placeholder="Alex Morgan" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} /></label>}<label>Work email<input required type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} /></label>{isContact ? <><label>Company<input required autoComplete="organization" placeholder="Your company" value={company} onChange={(event) => setCompany(event.target.value)} maxLength={160} /></label><label>What can we help with?<textarea required rows={4} placeholder="Tell us about your team and goals..." value={message} onChange={(event) => setMessage(event.target.value)} maxLength={5000} /></label></> : <label>{isLogin ? 'Password' : 'Create a password'}<input required type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={8} maxLength={256} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} /></label>}{error && <p className="form-error" role="alert">{error}</p>}<button className="button form-submit" type="submit" disabled={loading}>{loading ? 'Please wait…' : isContact ? 'Send inquiry' : isLogin ? 'Log in' : 'Create free account'} <ArrowRight size={15} /></button></form>}{!isContact && <p className="form-switch">{isLogin ? 'New to Nexara?' : 'Already have an account?'} <a href={isLogin ? '/signup' : '/login'}>{isLogin ? 'Start free' : 'Log in'}</a></p>}{isContact && <a className="back-link" href="/">Back to home</a>}</div></main><Footer /></>
}

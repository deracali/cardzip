"use client";

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { apiRequest } from '../services/api'

function CreatorAuthPage({ signUp = false, adminLogin = false }: { signUp?: boolean; adminLogin?: boolean }) {
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [handle, setHandle] = useState('')

  useEffect(() => {
    setHandle(new URLSearchParams(window.location.search).get('handle') || '')
  }, [])

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice('')
    const form = new FormData(event.currentTarget)
    try {
      const result = await apiRequest<{ user: { role: string } }>(signUp ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          handle: form.get('handle'),
          email: form.get('email'),
          password: form.get('password'),
        }),
      })
      const next = new URLSearchParams(window.location.search).get('next')
      const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : null
      if (adminLogin && result.user.role !== 'admin') {
        await apiRequest('/auth/logout', { method: 'POST' })
        throw new Error('This account does not have platform administrator access.')
      }
      window.location.href = safeNext || (result.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to continue.')
    }
  }

  return (
    <main className="creator-auth-page">
      <a className="creator-auth-back" href="/">← Back to CreatorHub</a>
      <section className="creator-auth-card" aria-labelledby="creator-auth-title">
        <a className="creator-brand creator-auth-brand" href="/">
          <img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" /><span>CreatorHub</span>
        </a>
        <div className="creator-auth-avatar">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=85" alt="" />
          <span><Check size={10} /></span>
        </div>
        <h1 id="creator-auth-title">{adminLogin ? 'Platform admin sign in' : signUp ? 'Claim your creator link' : 'Welcome back, Creator'}</h1>
        <p>{adminLogin ? 'Sign in to manage Creator Hub accounts, content and payments.' : signUp ? 'Your hub, newsletter & store in one place.' : 'Manage your link hub, newsletter and digital sales.'}</p>

        <form className="creator-auth-form" onSubmit={submitForm}>
          {signUp && (
            <>
              <label className="creator-auth-field">
                <span>Choose your handle</span>
                <div className="creator-auth-input creator-handle-field"><span>creatorhub.com/</span><input name="handle" aria-label="Creator handle" value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="yourname" pattern="[A-Za-z0-9._-]+" minLength={3} maxLength={30} required /></div>
              </label>
              <label className="creator-auth-field">
                <span>Full name</span>
                <div className="creator-auth-input"><UserRound size={15} /><input name="name" autoComplete="name" placeholder="Your name" required /></div>
              </label>
            </>
          )}
          <label className="creator-auth-field">
            <span>Email address</span>
            <div className="creator-auth-input"><Mail size={15} /><input name="email" type="email" autoComplete="email" placeholder="you@email.com" required /></div>
          </label>
          <label className="creator-auth-field">
            <span>Password</span>
            <div className="creator-auth-input"><LockKeyhole size={15} /><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={signUp ? 'new-password' : 'current-password'} placeholder={signUp ? 'At least 8 characters' : 'Your password'} minLength={signUp ? 8 : undefined} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
          </label>
          {adminLogin && <div className="creator-auth-options"><a href="/">Back to Creator Hub</a></div>}
          {signUp && <label className="creator-auth-terms"><input type="checkbox" required /> <span>I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</span></label>}
          <button className="creator-button creator-button-primary creator-auth-submit" type="submit">{signUp ? 'Create my hub' : 'Sign in to dashboard'} <ArrowRight size={15} /></button>
        </form>

        {notice && <p className="creator-auth-notice" role="status">{notice}</p>}
        {!adminLogin && <p className="creator-auth-switch">{signUp ? 'Already registered?' : 'Don’t have an account?'} <a href={signUp ? '/login' : '/signup'}>{signUp ? 'Sign in' : 'Sign up'}</a></p>}
      </section>
      {!adminLogin && <p className="creator-auth-security"><LockKeyhole size={13} /> Your account is protected by secure authentication.</p>}
    </main>
  )
}

export default CreatorAuthPage

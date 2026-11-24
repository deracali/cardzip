import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, BadgeCheck, CalendarCheck, CalendarDays, Camera, Clock3, HeartPulse, LogOut, Save,
  MapPin, ShieldCheck, Stethoscope, UserRound, Users, Video,
} from 'lucide-react'
import { patientDemoAppointments, providerDemoAppointments } from '../data/dashboardDemo'
import { doctors as starterDoctors, specialties } from '../data/doctors'
import CustomSelect from '../components/CustomSelect'
import styles from './CarewellPortal.module.css'

const DEMO_SESSION_KEY = 'carewell-demo-session-v1'
const LOCAL_PROVIDER_PROFILES_KEY = 'carewell-demo-provider-profiles-v1'

async function request(apiBaseUrl, path, options = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      ...options,
    })
  } catch (error) {
    throw new Error(`Could not connect to Carewell API: ${error.message}`, { cause: error })
  }
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const requestError = new Error(result.error || `Request failed (${response.status}).`)
    requestError.status = response.status
    throw requestError
  }
  return result
}

function dateLabel(value, options = {}) {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return 'Date to be confirmed'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...options,
  }).format(date)
}

function readLocalAppointments(user, role) {
  if (role === 'patient') return patientDemoAppointments
  return providerDemoAppointments.map((appointment) => ({ ...appointment, doctorName: user.name || appointment.doctorName }))
}

function getProviderForm(user, profile) {
  return {
    name: profile?.name || user?.name || '',
    specialty: profile?.specialty || specialties[0],
    credentials: profile?.credentials || '',
    location: profile?.location || '',
    fee: String(profile?.fee ?? 100),
    experience: profile?.experience || '',
    bio: profile?.bio || '',
    education: profile?.education || '',
    availability: Array.isArray(profile?.availability) ? profile.availability.join(', ') : '9:00 AM, 10:30 AM, 1:00 PM',
    image: profile?.image || '',
  }
}

function ProviderProfileEditor({ user, mode, apiBaseUrl }) {
  const [profile, setProfile] = useState(() => getProviderForm(user, null))
  const [savedProfile, setSavedProfile] = useState(null)
  const [loading, setLoading] = useState(mode === 'api')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [profileStatus, setProfileStatus] = useState(user?.providerStatus || 'pending')

  useEffect(() => {
    let active = true
    async function loadProfile() {
      try {
        let saved
        if (mode === 'local') {
          const profiles = JSON.parse(localStorage.getItem(LOCAL_PROVIDER_PROFILES_KEY) || '{}') || {}
          saved = profiles[user.id] || null
        } else {
          const result = await request(apiBaseUrl, '/providers/profile')
          saved = result.profile
        }
        if (active) {
          setSavedProfile(saved)
          setProfile(getProviderForm(user, saved))
        }
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadProfile()
    return () => { active = false }
  }, [apiBaseUrl, mode, user])

  function updateField(key, value) {
    setProfile((current) => ({ ...current, [key]: value }))
    setError('')
    setNotice('')
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.')
      event.target.value = ''
      return
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setError('Choose an image no larger than 1.5 MB.')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('Unable to read this photo. Try another image.')
        return
      }
      updateField('image', reader.result)
    }
    reader.onerror = () => setError('Unable to read this photo. Try another image.')
    reader.readAsDataURL(file)
  }

  async function saveProfile(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    const availability = profile.availability.split(',').map((time) => time.trim()).filter(Boolean)
    const payload = {
      ...profile,
      fee: Number(profile.fee),
      availability,
    }
    if (!payload.name.trim() || !payload.specialty || !payload.location.trim() || !payload.experience.trim()
      || !payload.bio.trim() || !payload.education.trim() || !payload.image
      || !Number.isFinite(payload.fee) || payload.fee < 0 || !availability.length) {
      setError('Add your photo and complete all required doctor profile details before saving.')
      return
    }

    setSaving(true)
    try {
      let updatedProfile
      let updatedStatus = profileStatus
      if (mode === 'local') {
        const profiles = JSON.parse(localStorage.getItem(LOCAL_PROVIDER_PROFILES_KEY) || '{}') || {}
        const baseSlug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'provider'
        const collides = starterDoctors.some((doctor) => doctor.slug === baseSlug)
          || Object.entries(profiles).some(([profileUserId, item]) => profileUserId !== user.id && item?.slug === baseSlug)
        const slug = savedProfile?.slug || (collides ? `${baseSlug}-${String(user.id).slice(-8)}` : baseSlug)
        updatedProfile = { ...payload, slug, rating: savedProfile?.rating || 0, reviews: savedProfile?.reviews || 0, active: true }
        localStorage.setItem(LOCAL_PROVIDER_PROFILES_KEY, JSON.stringify({ ...profiles, [user.id]: updatedProfile }))
        updatedStatus = 'approved'
      } else {
        const result = await request(apiBaseUrl, '/providers/profile', { method: 'PUT', body: JSON.stringify(payload) })
        updatedProfile = result.profile
        updatedStatus = result.providerStatus
      }
      setSavedProfile(updatedProfile)
      setProfileStatus(updatedStatus)
      setProfile(getProviderForm(user, updatedProfile))
      setNotice(mode === 'local'
        ? 'Saved to this browser. Your demo doctor profile is now visible in the Vite directory.'
        : updatedStatus === 'approved'
          ? 'Your public doctor profile has been updated.'
          : 'Your profile was submitted for Carewell review and will appear in the directory after approval.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const isApproved = profileStatus === 'approved'
  if (loading) return <div className={styles.profileLoading}><span /> Loading your doctor profile</div>

  return (
    <section className={`${styles.panel} ${styles.providerProfilePage}`}>
      <div className={styles.panelHeading}>
        <div><span>PUBLIC DOCTOR LISTING</span><h2>Build your provider profile</h2><p>Add the details patients need to find and choose your practice.</p></div>
        <Stethoscope size={20} />
      </div>
      <div className={styles.providerProfileStatus}>
        <span className={isApproved ? styles.statusApproved : styles.statusPending}>{isApproved ? 'Approved' : profileStatus === 'rejected' ? 'Changes requested' : 'Review required'}</span>
        <p>{mode === 'local'
          ? 'Vite uses a browser-only demo profile; saving it makes the listing visible in this local directory.'
          : isApproved
            ? 'Your listing is public. You can update your details here.'
            : 'Your listing stays private until the Carewell team approves your profile.'}</p>
      </div>
      {error && <div className={styles.error} role="alert">{error}</div>}
      {notice && <div className={styles.profileNotice} role="status">{notice}</div>}
      <form className={styles.providerProfileForm} onSubmit={saveProfile}>
        <div className={styles.providerPhotoField}>
          <div className={styles.providerPhotoPreview}>{profile.image ? <img src={profile.image} alt="Provider profile preview" /> : <Camera size={24} />}</div>
          <div><strong>Profile photo <span>*</span></strong><small>JPG, PNG, or WebP · up to 1.5 MB</small>
            <label className={styles.uploadButton}><Camera size={14} /> {profile.image ? 'Change photo' : 'Upload photo'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} /></label>
          </div>
        </div>
        <div className={styles.profileFormGrid}>
          <label className={styles.profileField}>Public name <span>*</span><input value={profile.name} maxLength={120} required onChange={(event) => updateField('name', event.target.value)} placeholder="Dr. Alex Morgan" /></label>
          <label className={styles.profileField}>Specialty <span>*</span><CustomSelect className={styles.profileSelect} triggerClassName={styles.profileSelectTrigger} value={profile.specialty} onChange={(value) => updateField('specialty', value)} ariaLabel="Doctor specialty" options={specialties.map((item) => ({ value: item, label: item }))} /></label>
          <label className={styles.profileField}>Credentials<input value={profile.credentials} maxLength={100} onChange={(event) => updateField('credentials', event.target.value)} placeholder="MD, FACC" /></label>
          <label className={styles.profileField}>Practice location <span>*</span><input value={profile.location} maxLength={120} required onChange={(event) => updateField('location', event.target.value)} placeholder="City, State" /></label>
          <label className={styles.profileField}>Years of experience <span>*</span><input value={profile.experience} maxLength={40} required onChange={(event) => updateField('experience', event.target.value)} placeholder="8 years" /></label>
          <label className={styles.profileField}>Visit fee (USD) <span>*</span><input type="number" min="0" max="10000" step="0.01" value={profile.fee} required onChange={(event) => updateField('fee', event.target.value)} /></label>
          <label className={`${styles.profileField} ${styles.profileFieldWide}`}>Education <span>*</span><input value={profile.education} maxLength={240} required onChange={(event) => updateField('education', event.target.value)} placeholder="Medical school or training" /></label>
          <label className={`${styles.profileField} ${styles.profileFieldWide}`}>About your practice <span>*</span><textarea value={profile.bio} maxLength={1200} required rows={4} onChange={(event) => updateField('bio', event.target.value)} placeholder="Tell patients about your approach and areas of focus." /></label>
          <label className={`${styles.profileField} ${styles.profileFieldWide}`}>Available appointment times <span>*</span><input value={profile.availability} required onChange={(event) => updateField('availability', event.target.value)} placeholder="9:00 AM, 10:30 AM, 1:00 PM" /><small>Enter up to 12 times separated by commas.</small></label>
        </div>
        <div className={styles.profileFormFooter}><small><ShieldCheck size={14} /> Your profile is connected to your Carewell provider account.</small><button type="submit" disabled={saving}>{saving ? 'Saving profile…' : <><Save size={15} /> Save doctor profile</>}</button></div>
      </form>
    </section>
  )
}

function AppointmentRows({ appointments, isProvider }) {
  return appointments.map((appointment) => (
    <article className={styles.appointment} key={appointment._id || appointment.id || appointment.reference}>
      <span className={styles.calendar}><CalendarDays size={16} /><b>{dateLabel(appointment.startsAt, { day: '2-digit', weekday: undefined, year: undefined, hour: undefined, minute: undefined })}</b></span>
      <div className={styles.appointmentInfo}>
        <strong>{isProvider ? appointment.patientName : appointment.doctorName}</strong>
        <small>{appointment.specialty} <span>·</span> {appointment.appointmentType === 'online' ? <><Video size={12} /> Online visit</> : <><MapPin size={12} /> In-person visit</>}</small>
        <small>{dateLabel(appointment.startsAt)} <span>·</span> {appointment.reference || 'Appointment request'}</small>
      </div>
      <span className={`${styles.status} ${styles[`status_${appointment.status}`] || ''}`}>{appointment.status || 'pending'}</span>
    </article>
  ))
}

export default function CarewellPortal({ apiBaseUrl, role = 'patient', mode = 'api', section = 'overview' }) {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [appointmentFilter, setAppointmentFilter] = useState('all')
  const isProvider = role === 'provider'
  const dashboardPath = isProvider ? '/provider/dashboard' : '/dashboard'

  useEffect(() => {
    let active = true
    async function load() {
      try {
        if (mode === 'local') {
          const localUser = JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || 'null')
          if (!localUser) {
            const next = encodeURIComponent(dashboardPath)
            window.location.replace(`/login?next=${next}`)
            return
          }
          if (localUser.role !== role) {
            window.location.replace(localUser.role === 'provider' ? '/provider/dashboard' : '/dashboard')
            return
          }
          const localAppointments = readLocalAppointments(localUser, role)
          if (active) {
            setUser(localUser)
            setAppointments(localAppointments)
          }
          return
        }

        const session = await request(apiBaseUrl, '/auth/me')
        if (session.user.role !== role) {
          const route = session.user.role === 'admin' ? '/admin' : session.user.role === 'provider' ? '/provider/dashboard' : '/dashboard'
          window.location.replace(route)
          return
        }
        if (active) setUser(session.user)
        if (role === 'provider' && session.user.providerStatus !== 'approved') return
        const result = await request(apiBaseUrl, role === 'provider' ? '/appointments/provider' : '/appointments/mine')
        if (active) setAppointments(result.appointments || [])
      } catch (loadError) {
        if (!active) return
        if (loadError.status === 401) window.location.replace(`/login?next=${encodeURIComponent(dashboardPath)}`)
        else setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [apiBaseUrl, dashboardPath, mode, role])

  async function signOut() {
    if (mode === 'local') {
      localStorage.removeItem(DEMO_SESSION_KEY)
      window.location.replace('/')
      return
    }
    try {
      await request(apiBaseUrl, '/auth/logout', { method: 'POST' })
      window.location.replace('/')
    } catch (signOutError) {
      setError(signOutError.message)
    }
  }

  const sortedAppointments = useMemo(() => [...appointments].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)), [appointments])
  const upcomingAppointments = sortedAppointments.filter((appointment) =>
    new Date(appointment.startsAt) >= new Date() && appointment.status !== 'cancelled')
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'pending')
  const patientCount = new Set(appointments.map((appointment) => appointment.patientEmail).filter(Boolean)).size
  const nextAppointment = upcomingAppointments[0]
  const visibleAppointments = sortedAppointments.filter((appointment) => {
    if (appointmentFilter === 'upcoming') return new Date(appointment.startsAt) >= new Date() && appointment.status !== 'cancelled'
    if (appointmentFilter === 'past') return new Date(appointment.startsAt) < new Date()
    if (appointmentFilter === 'cancelled') return appointment.status === 'cancelled'
    return true
  })
  const providerPatients = useMemo(() => {
    const patients = new Map()
    appointments.forEach((appointment) => {
      const key = appointment.patientEmail || appointment.patientName
      if (!key) return
      const patient = patients.get(key) || { name: appointment.patientName, visits: 0, lastVisit: appointment.startsAt }
      patient.visits += 1
      if (new Date(appointment.startsAt) > new Date(patient.lastVisit)) patient.lastVisit = appointment.startsAt
      patients.set(key, patient)
    })
    return [...patients.values()].sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
  }, [appointments])
  const pageTitles = {
    overview: 'Overview',
    appointments: 'My appointments',
    schedule: 'Practice schedule',
    patients: 'Patients',
    profile: 'My profile',
  }
  const pageDescriptions = {
    appointments: 'View upcoming visits, requests, and your complete appointment history.',
    schedule: 'Review the visit schedule linked to your approved doctor profile.',
    patients: 'See patients from your Carewell appointment history.',
    profile: 'Review the account details connected to your Carewell workspace.',
  }

  if (loading) return <div className={styles.loading}><span /> Loading your Carewell workspace</div>

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="/">
          <span className={styles.brandMark}><HeartPulse size={18} /></span>
          <strong>carewell<span>.</span></strong>
        </a>
        <div className={styles.sidebarLabel}>WORKSPACE</div>
        <nav className={styles.nav} aria-label="Dashboard navigation">
          {(isProvider
            ? [
                { key: 'overview', label: 'Overview', href: '/provider/dashboard', icon: CalendarCheck },
                { key: 'schedule', label: 'Schedule', href: '/provider/dashboard/schedule', icon: CalendarDays },
                { key: 'patients', label: 'Patients', href: '/provider/dashboard/patients', icon: Users },
                { key: 'profile', label: 'My profile', href: '/provider/dashboard/profile', icon: UserRound },
                { key: 'directory', label: 'Care directory', href: '/doctors', icon: Stethoscope },
              ]
            : [
                { key: 'overview', label: 'Overview', href: '/dashboard', icon: CalendarCheck },
                { key: 'appointments', label: 'Appointments', href: '/dashboard/appointments', icon: CalendarDays },
                { key: 'doctors', label: 'Find a doctor', href: '/doctors', icon: Stethoscope },
                { key: 'profile', label: 'My profile', href: '/dashboard/profile', icon: UserRound },
              ]).map(({ key, label, href, icon: Icon }) => (
            <a className={section === key ? styles.navActive : ''} aria-current={section === key ? 'page' : undefined} href={href} key={key}><Icon size={17} /> {label}</a>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.privacyCard}><ShieldCheck size={17} /><strong>{mode === 'api' ? 'Your privacy matters' : 'Static demo workspace'}</strong><span>{mode === 'api' ? 'Carewell only displays appointment details in this workspace.' : 'Vite uses sample appointments. Demo data is not connected to the API.'}</span></div>
          <a className={styles.sidebarHome} href="/"><ArrowRight size={14} /> Back to Carewell</a>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.header}>
          <div><span className={styles.headerEyebrow}>{isProvider ? 'PROVIDER WORKSPACE' : 'PATIENT WORKSPACE'}</span><strong>{pageTitles[section] || 'Overview'}</strong></div>
          <div className={styles.headerActions}>
            <span className={styles.secure}><ShieldCheck size={14} /> {mode === 'api' ? 'Connected account' : 'Static demo data'}</span>
            <span className={styles.userChip}><span>{user?.name?.slice(0, 1)?.toUpperCase() || 'C'}</span>{user?.name || 'Carewell member'}</span>
            <button className={styles.signOut} onClick={signOut}><LogOut size={15} /> Sign out</button>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.welcome}>
            <div>
              <span className={styles.eyebrow}>{isProvider ? 'YOUR CARE PRACTICE' : 'YOUR HEALTH, MADE SIMPLER'}</span>
              <h1>{section === 'overview'
                ? isProvider ? `Welcome, ${user?.name || 'Doctor'}` : `Good to see you, ${user?.name?.split(' ')[0] || 'there'}`
                : pageTitles[section] || 'Carewell workspace'}</h1>
              <p>{section === 'overview'
                ? isProvider ? 'Keep track of your schedule and patient appointment requests.' : 'Review your visits, plan your next appointment, and stay connected to your care team.'
                : pageDescriptions[section] || (isProvider ? 'Manage your Carewell provider workspace.' : 'Manage your Carewell account.')}</p>
            </div>
            <a className={styles.primaryAction} href={isProvider ? '/doctors' : '/book-now'}>
              {isProvider ? 'View care directory' : 'Book an appointment'} <ArrowRight size={16} />
            </a>
          </section>

          {error && <div className={styles.error} role="alert">{error}</div>}
          {isProvider && user?.providerStatus !== 'approved' && (
            <div className={styles.pending}>
              <span><Clock3 size={18} /></span>
              <div><strong>Complete your public doctor profile</strong><p>Your account is {user?.providerStatus || 'pending'}. Add your photo and practice details for review; your listing will appear in the doctor directory after approval.</p></div>
              <a href="/provider/dashboard/profile">Set up profile <ArrowRight size={13} /></a>
              <span className={styles.reviewBadge}>IN REVIEW</span>
            </div>
          )}

          {section === 'overview' ? <>
          {nextAppointment && (
            <section className={styles.nextVisit}>
              <div className={styles.nextIcon}><CalendarCheck size={20} /></div>
              <div><span>NEXT APPOINTMENT</span><strong>{isProvider ? nextAppointment.patientName : nextAppointment.doctorName}</strong><small>{dateLabel(nextAppointment.startsAt)} · {nextAppointment.appointmentType === 'online' ? 'Online visit' : 'In-person visit'}</small></div>
              <span className={`${styles.status} ${styles[`status_${nextAppointment.status}`] || ''}`}>{nextAppointment.status}</span>
            </section>
          )}

          <section className={styles.stats} aria-label="Appointment summary">
            <article className={styles.statCard}><span className={styles.statIcon}><CalendarDays size={18} /></span><div><small>UPCOMING VISITS</small><strong>{upcomingAppointments.length}</strong><span>{upcomingAppointments.length === 1 ? 'appointment scheduled' : 'appointments scheduled'}</span></div></article>
            <article className={styles.statCard}><span className={`${styles.statIcon} ${styles.statIconMint}`}><Clock3 size={18} /></span><div><small>AWAITING CONFIRMATION</small><strong>{pendingAppointments.length}</strong><span>{pendingAppointments.length === 1 ? 'request in progress' : 'requests in progress'}</span></div></article>
            <article className={styles.statCard}><span className={`${styles.statIcon} ${styles.statIconBlue}`}>{isProvider ? <Users size={18} /> : <BadgeCheck size={18} />}</span><div><small>{isProvider ? 'UNIQUE PATIENTS' : 'TOTAL VISITS'}</small><strong>{isProvider ? patientCount : appointments.length}</strong><span>{isProvider ? 'in your appointment history' : 'in your Carewell history'}</span></div></article>
          </section>

          <section className={styles.panel} id="appointments">
            <div className={styles.panelHeading}>
              <div><span>{isProvider ? 'YOUR PRACTICE' : 'YOUR CARE'}</span><h2>{isProvider ? 'Appointment schedule' : 'Your appointments'}</h2><p>{isProvider ? 'Review upcoming visits and patient requests.' : 'Your upcoming visits and appointment history in one place.'}</p></div>
              <CalendarDays size={20} />
            </div>
            {sortedAppointments.length ? (
              <div className={styles.appointments}>
                {sortedAppointments.map((appointment) => (
                  <article className={styles.appointment} key={appointment._id || appointment.id || appointment.reference}>
                    <span className={styles.calendar}><CalendarDays size={16} /><b>{dateLabel(appointment.startsAt, { day: '2-digit', weekday: undefined, year: undefined, hour: undefined, minute: undefined })}</b></span>
                    <div className={styles.appointmentInfo}>
                      <strong>{isProvider ? appointment.patientName : appointment.doctorName}</strong>
                      <small>{appointment.specialty} <span>·</span> {appointment.appointmentType === 'online' ? <><Video size={12} /> Online visit</> : <><MapPin size={12} /> In-person visit</>}</small>
                      <small>{dateLabel(appointment.startsAt)} <span>·</span> {appointment.reference || 'Appointment request'}</small>
                    </div>
                    <span className={`${styles.status} ${styles[`status_${appointment.status}`] || ''}`}>{appointment.status || 'pending'}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <span><CalendarDays size={22} /></span>
                <strong>{isProvider && user?.providerStatus !== 'approved' ? 'Your schedule is getting ready' : 'No appointments yet'}</strong>
                <p>{isProvider
                  ? user?.providerStatus === 'approved' ? 'Patient requests assigned to your profile will appear here.' : 'Once your provider profile is approved, your schedule will appear here.'
                  : 'When you book a visit, your appointment details and status will appear here.'}</p>
                {!isProvider && <a href="/doctors">Explore doctors <ArrowRight size={14} /></a>}
              </div>
            )}
          </section>
          {isProvider ? (
            <div className={styles.dashboardExtras}>
              <section className={styles.panel}>
                <div className={styles.panelHeading}><div><span>PROVIDER ONBOARDING</span><h2>Your next steps</h2><p>Keep track of what is needed to open your Carewell schedule.</p></div><Stethoscope size={20} /></div>
                <ol className={styles.providerSteps}>
                  <li className={user?.providerStatus === 'approved' ? styles.stepComplete : styles.stepCurrent}>
                    <span>{user?.providerStatus === 'approved' ? <BadgeCheck size={16} /> : '01'}</span>
                    <div><strong>{user?.providerStatus === 'approved' ? 'Provider profile approved' : 'Submit your doctor profile'}</strong><small>{user?.providerStatus === 'approved' ? 'Your listing is visible in the doctor directory.' : 'Add your photo and practice details for the Carewell team to review.'}</small></div>
                    <em>{user?.providerStatus === 'approved' ? 'Complete' : 'In review'}</em>
                  </li>
                  <li className={user?.providerStatus === 'approved' ? styles.stepComplete : ''}>
                    <span>{user?.providerStatus === 'approved' ? <BadgeCheck size={16} /> : '02'}</span>
                    <div><strong>Doctor directory listing</strong><small>{user?.providerStatus === 'approved' ? 'Patients can discover your approved profile.' : 'Your profile is published after approval.'}</small></div>
                    <em>{user?.providerStatus === 'approved' ? 'Ready' : 'Next'}</em>
                  </li>
                  <li>
                    <span>03</span>
                    <div><strong>Review appointment requests</strong><small>Patient requests assigned to your doctor profile appear in the schedule above.</small></div>
                    <em>{appointments.length ? `${appointments.length} visit${appointments.length === 1 ? '' : 's'}` : 'Waiting'}</em>
                  </li>
                </ol>
              </section>
              <aside className={styles.practiceCard}>
                <span className={styles.practiceIcon}><CalendarCheck size={19} /></span>
                <small>YOUR PRACTICE SNAPSHOT</small>
                <strong>{upcomingAppointments.length}</strong>
                <p>upcoming appointment{upcomingAppointments.length === 1 ? '' : 's'}</p>
                <div><span>Awaiting confirmation</span><b>{pendingAppointments.length}</b></div>
                <a href="/doctors">View care directory <ArrowRight size={14} /></a>
              </aside>
            </div>
          ) : (
            <div className={styles.dashboardExtras}>
              <section className={styles.panel}>
                <div className={styles.panelHeading}><div><span>YOUR CARE JOURNEY</span><h2>Simple ways to stay on track</h2><p>Everything you need to plan your next visit is close at hand.</p></div><HeartPulse size={20} /></div>
                <div className={styles.quickLinks}>
                  <a href="/doctors"><span><Stethoscope size={17} /></span><div><strong>Find a specialist</strong><small>Explore doctors by specialty and location.</small></div><ArrowRight size={15} /></a>
                  <a href="/book-now"><span><CalendarDays size={17} /></span><div><strong>Plan your next visit</strong><small>Choose a doctor, visit type, and available time.</small></div><ArrowRight size={15} /></a>
                  <a href="#appointments"><span><BadgeCheck size={17} /></span><div><strong>Track your requests</strong><small>Check the status and details of each appointment.</small></div><ArrowRight size={15} /></a>
                </div>
              </section>
              <aside className={styles.visitGuide}>
                <span className={styles.guideIcon}><ShieldCheck size={19} /></span>
                <small>BEFORE YOUR VISIT</small>
                <h3>A calmer appointment starts here.</h3>
                <p>Confirm the date and visit type in your appointment details. For online visits, choose a private, quiet space; for in-person care, check the provider’s location.</p>
                <a href="/about">Carewell help and information <ArrowRight size={14} /></a>
              </aside>
            </div>
          )}
          </> : section === 'profile' && isProvider ? (
            <ProviderProfileEditor user={user} mode={mode} apiBaseUrl={apiBaseUrl} />
          ) : section === 'profile' ? (
            <section className={`${styles.panel} ${styles.profilePage}`}>
              <div className={styles.panelHeading}><div><span>ACCOUNT SETTINGS</span><h2>Profile details</h2><p>Your account information and access level.</p></div><UserRound size={20} /></div>
              <div className={styles.profileHero}>
                <span>{user?.name?.slice(0, 1)?.toUpperCase() || 'C'}</span>
                <div><strong>{user?.name || 'Carewell member'}</strong><small>{isProvider ? 'Provider account' : 'Patient account'}</small></div>
                <em className={user?.providerStatus === 'approved' ? styles.profileApproved : ''}>{isProvider ? user?.providerStatus || 'pending' : 'active'}</em>
              </div>
              <div className={styles.profileDetails}>
                {[
                  { label: 'Full name', value: user?.name || 'Not provided' },
                  { label: 'Email address', value: user?.email || 'Not provided' },
                  { label: 'Phone number', value: user?.phone || 'Not provided' },
                  { label: 'Account type', value: isProvider ? 'Doctor / provider' : 'Patient' },
                  ...(isProvider ? [{ label: 'Provider status', value: user?.providerStatus || 'pending' }] : []),
                ].map(({ label, value }) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}
              </div>
              <p className={styles.profilePrivacy}><ShieldCheck size={16} /> Account details are managed securely by Carewell. Contact the care team if you need to update your information.</p>
            </section>
          ) : section === 'patients' && isProvider ? (
            <section className={styles.panel}>
              <div className={styles.panelHeading}><div><span>CARE HISTORY</span><h2>Patients from your appointments</h2><p>Only appointment-related information is shown here.</p></div><Users size={20} /></div>
              {providerPatients.length ? (
                <div className={styles.patientRows}>{providerPatients.map((patient, index) => (
                  <article className={styles.patientRow} key={`${patient.name}-${index}`}>
                    <span>{patient.name?.slice(0, 1)?.toUpperCase() || 'P'}</span>
                    <div><strong>{patient.name || 'Carewell patient'}</strong><small>{patient.visits} appointment{patient.visits === 1 ? '' : 's'} in your schedule</small></div>
                    <div><small>LAST VISIT</small><strong>{dateLabel(patient.lastVisit, { weekday: undefined, hour: undefined, minute: undefined })}</strong></div>
                  </article>
                ))}</div>
              ) : (
                <div className={styles.empty}><span><Users size={22} /></span><strong>No patient appointments yet</strong><p>Patient details appear here after an appointment has been assigned to your doctor profile.</p></div>
              )}
            </section>
          ) : (
            <section className={styles.panel}>
              <div className={styles.panelHeading}><div><span>{isProvider ? 'YOUR PRACTICE' : 'YOUR CARE'}</span><h2>{isProvider ? 'Appointment schedule' : 'Appointment history'}</h2><p>{isProvider ? 'Review patient requests and upcoming visits.' : 'View and track your appointments with Carewell doctors.'}</p></div><CalendarDays size={20} /></div>
              <div className={styles.appointmentFilters} role="group" aria-label="Filter appointments">
                {['all', 'upcoming', 'past', 'cancelled'].map((filter) => <button className={appointmentFilter === filter ? styles.filterActive : ''} type="button" key={filter} onClick={() => setAppointmentFilter(filter)}>{filter === 'all' ? 'All visits' : filter[0].toUpperCase() + filter.slice(1)}</button>)}
              </div>
              {visibleAppointments.length ? <div className={styles.appointments}><AppointmentRows appointments={visibleAppointments} isProvider={isProvider} /></div> : (
                <div className={styles.empty}><span><CalendarDays size={22} /></span><strong>{appointmentFilter === 'all' ? 'No appointments yet' : `No ${appointmentFilter} appointments`}</strong><p>{isProvider ? 'Visits assigned to your provider profile will appear here.' : 'Choose a doctor and request a visit to start your Carewell history.'}</p>{!isProvider && <a href="/doctors">Explore doctors <ArrowRight size={14} /></a>}</div>
              )}
            </section>
          )}
          <footer className={styles.footer}><span>Carewell · Better care starts here</span><a href="/about">Help and information</a></footer>
        </div>
      </section>
    </main>
  )
}

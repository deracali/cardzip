import { useState } from 'react'
import {
  ArrowRight,
  CarFront,
  ClipboardList,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Users,
  X,
} from 'lucide-react'
import {
  addVehicle,
  getAccounts,
  getBookings,
  getCurrentUser,
  getFleet,
  removeVehicle,
  signIn,
  signOut,
  uploadVehicleImage,
  updateBookingStatus,
} from '../services/rentalStore'
import { imageUrl } from '../data/vehicles'
import './AccountPages.css'

const adminSections = ['Overview', 'Bookings', 'Fleet', 'Customers', 'Settings']
const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled']

function PortalFrame({ children, section, sections, onSectionChange, roleLabel, user, onSignOut }) {
  const icons = {
    Overview: LayoutDashboard,
    Bookings: ClipboardList,
    Fleet: CarFront,
    Customers: Users,
    Settings,
  }
  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <a className="brand brand-light" href="/" aria-label="Voltigo home">
          <span className="brand-icon">ϟ</span><span className="brand-name">VOLTIGO<span>RENTAL + LOGISTICS</span></span>
        </a>
        <div className="portal-nav-wrap"><span className="portal-nav-label">{roleLabel} WORKSPACE</span>
          <nav className="portal-nav" aria-label={`${roleLabel} pages`}>
            {sections.map((name) => {
              const Icon = icons[name] || CarFront
              return <button key={name} type="button" className={section === name ? 'is-active' : ''} onClick={() => onSectionChange(name)}><Icon size={16} />{name}</button>
            })}
          </nav>
        </div>
        <div className="portal-sidebar-bottom">
          <a className="portal-sidebar-link" href="/">Back to Voltigo <ArrowRight size={14} /></a>
          <button className="portal-sidebar-link" type="button" onClick={onSignOut}><LogOut size={14} /> Sign out</button>
        </div>
      </aside>
      <main className="portal-main">
        <header className="portal-topbar"><div><small>VOLTIGO · {roleLabel.toUpperCase()}</small><strong>{roleLabel} workspace</strong></div><div className="portal-user"><span>{user.name?.slice(0, 1).toUpperCase() || 'V'}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div></header>
        {children}
      </main>
    </div>
  )
}

function PortalHeading({ eyebrow, title, copy, action }) {
  return <div className="portal-heading"><div><small>{eyebrow}</small><h1>{title}</h1><p>{copy}</p></div>{action}</div>
}

function MetricCard({ icon: Icon, label, value, note }) {
  return <article className="portal-metric"><span className="portal-metric-icon"><Icon size={17} /></span><small>{label}</small><strong>{value}</strong><span>{note}</span></article>
}

function BookingTable({ bookings, onStatusChange }) {
  return <section className="portal-card"><header className="portal-card-header"><div><h2>Reservations</h2><p>Review and update renter bookings.</p></div><span className="portal-count">{bookings.length} total</span></header>
    <div className="portal-table-scroll"><table className="portal-table"><thead><tr><th>Renter</th><th>Vehicle</th><th>Pickup</th><th>Trip dates</th><th>Total</th><th>Status</th></tr></thead><tbody>
      {bookings.map((booking) => <tr key={booking.id}><td><strong>{booking.customerName}</strong><small>{booking.customerEmail}</small></td><td><strong>{booking.vehicleName}</strong><small>{booking.vehicleCategory}</small></td><td>{booking.pickup}</td><td>{booking.start ? new Date(booking.start).toLocaleDateString() : 'Not set'} – {booking.end ? new Date(booking.end).toLocaleDateString() : 'Not set'}</td><td>${booking.total}</td><td><select className="portal-status-select" value={booking.status} aria-label={`Update status for ${booking.vehicleName}`} onChange={(event) => onStatusChange(booking.id, event.target.value)}>{statusOptions.map((status) => <option value={status} key={status}>{status}</option>)}</select></td></tr>)}
      {!bookings.length && <tr><td className="portal-empty" colSpan={6}>No reservations yet. New customer bookings appear here.</td></tr>}
    </tbody></table></div>
  </section>
}

export function AdminLoginPage() {
  const [notice, setNotice] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      signIn(form.get('email'), form.get('password'), true)
      window.location.href = '/admin'
    } catch (error) {
      setNotice(error.message)
    }
  }
  return <main className="portal-auth-screen"><section className="portal-auth-visual"><a className="brand brand-light" href="/"><span className="brand-icon">ϟ</span><span className="brand-name">VOLTIGO<span>RENTAL + LOGISTICS</span></span></a><div><small>VOLTIGO OPERATIONS</small><h1>Run every trip from one place.</h1><p>Manage reservations, fleet availability, and your renter community in a focused workspace.</p><span>Protected administrator workspace · Local demo only</span></div><footer>Voltigo Rental · Administrator access</footer></section><section className="portal-auth-form-wrap"><a href="/" className="portal-back-link">← Back to Voltigo</a><h2>Admin sign in</h2><p>Use your administrator account to manage the rental operation.</p><form className="portal-login-form" onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="username" required /></label><label>Password<span className="portal-password-input"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button></span></label><button className="portal-button" type="submit">Sign in to workspace <ArrowRight size={15} /></button></form>{notice && <p className="portal-error" role="alert">{notice}</p>}<small className="portal-demo-tip">Local demo: admin@voltigo.local · Admin123!</small><a className="portal-renter-login" href="/login">Looking for renter sign in?</a></section></main>
}

export function AdminPortal() {
  const [user] = useState(() => getCurrentUser())
  const [section, setSection] = useState('Overview')
  const [bookings, setBookings] = useState(() => getBookings())
  const [fleet, setFleet] = useState(() => getFleet())
  const [accounts, setAccounts] = useState(() => getAccounts().filter((account) => account.role === 'renter'))
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const pending = bookings.filter((booking) => booking.status === 'pending').length
  const revenue = bookings.filter((booking) => booking.status !== 'cancelled').reduce((sum, booking) => sum + Number(booking.total || 0), 0)

  if (!user || user.role !== 'admin') return <main className="portal-auth-required"><section><span className="portal-auth-badge">ADMIN ACCESS</span><h1>Sign in to manage your fleet</h1><p>The operations dashboard is available to Voltigo administrators.</p><a className="portal-button" href="/admin/login">Continue to admin sign in <ArrowRight size={15} /></a></section></main>

  function sync() {
    setBookings(getBookings())
    setFleet(getFleet())
    setAccounts(getAccounts().filter((account) => account.role === 'renter'))
    setRefresh((value) => value + 1)
  }
  function changeStatus(id, status) {
    try {
      updateBookingStatus(id, status)
      sync()
      setError('')
    } catch (storageError) {
      setError(storageError.message)
    }
  }
  async function submitVehicle(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const image = await uploadVehicleImage(form.get('imageFile'))
      addVehicle({
        name: form.get('name'),
        category: form.get('category'),
        price: form.get('price'),
        seats: form.get('seats'),
        fuel: form.get('fuel'),
        details: form.get('details'),
        image,
      })
      sync()
      setShowVehicleForm(false)
      setError('')
    } catch (storageError) {
      setError(storageError.message)
    }
  }
  function deleteVehicle(id) {
    if (!window.confirm('Remove this vehicle from the public fleet?')) return
    try {
      removeVehicle(id)
      sync()
    } catch (storageError) {
      setError(storageError.message)
    }
  }

  return <PortalFrame user={user} roleLabel="Admin" section={section} sections={adminSections} onSectionChange={setSection} onSignOut={() => { signOut(); window.location.href = '/' }}>
    <div className="portal-content" key={refresh}>
      {error && <p className="portal-error" role="alert">{error}</p>}
      <PortalHeading eyebrow="ADMINISTRATION" title={section} copy="A clear view of your fleet, customers, and upcoming trips." action={section === 'Fleet' && <button className="portal-button" type="button" onClick={() => setShowVehicleForm((open) => !open)}><Plus size={15} /> Add vehicle</button>} />
      {section === 'Overview' && <>
        <div className="portal-metrics"><MetricCard icon={CircleDollarSign} label="Booked revenue" value={`$${revenue.toLocaleString()}`} note="All non-cancelled reservations" /><MetricCard icon={ClipboardList} label="Reservations" value={bookings.length} note={`${pending} awaiting review`} /><MetricCard icon={CarFront} label="Active vehicles" value={fleet.length} note="Currently listed for booking" /><MetricCard icon={Users} label="Renter accounts" value={accounts.length} note="Registered customers" /></div>
        <BookingTable bookings={bookings.slice(0, 6)} onStatusChange={changeStatus} />
      </>}
      {section === 'Bookings' && <BookingTable bookings={bookings} onStatusChange={changeStatus} />}
      {section === 'Fleet' && <>
        {showVehicleForm && <section className="portal-card portal-add-vehicle"><header className="portal-card-header"><div><h2>Add a vehicle</h2><p>Upload a Cloudinary photo; the published listing appears on the renter fleet.</p></div><button aria-label="Close vehicle form" className="portal-icon-button" type="button" onClick={() => setShowVehicleForm(false)}><X size={16} /></button></header><form onSubmit={submitVehicle}><div className="portal-form-grid"><PortalField name="name" label="Vehicle name" placeholder="Summit Touring SUV" /><PortalField name="category" label="Category" placeholder="SUV" /><PortalField name="price" label="Daily rate ($)" placeholder="89" type="number" /><PortalField name="seats" label="Seats" placeholder="5" type="number" /><PortalField name="fuel" label="Fuel / transmission" placeholder="Hybrid · Auto" /><PortalField name="details" label="Vehicle details" placeholder="2025 · Hybrid · Airport ready" /><PortalField name="imageFile" label="Vehicle photo (JPEG, PNG, WebP, AVIF; max 10 MB)" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></div><div className="portal-form-actions"><button className="portal-button portal-button-muted" type="button" onClick={() => setShowVehicleForm(false)}>Cancel</button><button className="portal-button" type="submit">Upload photo &amp; save vehicle</button></div></form></section>}
        <section className="portal-card"><header className="portal-card-header"><div><h2>Fleet inventory</h2><p>Manage the vehicles your renters can book.</p></div><span className="portal-count">{fleet.length} vehicles</span></header><div className="portal-table-scroll"><table className="portal-table"><thead><tr><th>Vehicle</th><th>Type</th><th>Daily rate</th><th>Seats</th><th>Visibility</th><th></th></tr></thead><tbody>{fleet.map((vehicle) => <tr key={vehicle.id}><td><strong>{vehicle.name}</strong><small>{vehicle.details}</small></td><td>{vehicle.category}</td><td>${vehicle.price}/day</td><td>{vehicle.seats}</td><td><span className="portal-availability"><i /> Listed</span></td><td><button className="portal-button portal-button-small portal-button-muted" type="button" onClick={() => deleteVehicle(vehicle.id)}>Remove</button></td></tr>)}{!fleet.length && <tr><td colSpan={6} className="portal-empty">No active vehicles. Add your first vehicle to publish it.</td></tr>}</tbody></table></div></section>
      </>}
      {section === 'Customers' && <section className="portal-card"><header className="portal-card-header"><div><h2>Renter accounts</h2><p>Customers who have registered on this browser.</p></div><span className="portal-count">{accounts.length} renters</span></header><div className="portal-table-scroll"><table className="portal-table"><thead><tr><th>Renter</th><th>Email</th><th>Joined</th><th>Reservations</th></tr></thead><tbody>{accounts.map((account) => <tr key={account.id}><td><strong>{account.name}</strong></td><td>{account.email}</td><td>{new Date(account.createdAt).toLocaleDateString()}</td><td>{bookings.filter((booking) => booking.userId === account.id).length}</td></tr>)}{!accounts.length && <tr><td colSpan={4} className="portal-empty">Renter accounts will appear here after they sign up.</td></tr>}</tbody></table></div></section>}
      {section === 'Settings' && <section className="portal-card portal-settings"><header className="portal-card-header"><div><h2><Settings size={16} /> Workspace settings</h2><p>Local demo configuration and account details.</p></div></header><div><span>Signed in as</span><strong>{user.name}</strong><small>{user.email}</small></div><div><span>Data storage</span><strong>This browser only</strong><small>Fleet, reservations, and accounts are saved in localStorage. They are not shared across browsers.</small></div><div><span>Security note</span><strong>Demo credentials only</strong><small>Use the Next.js version with a server and database before accepting real customer data.</small></div></section>}
    </div>
  </PortalFrame>
}

export function ClientDashboard() {
  const [user] = useState(() => getCurrentUser())
  const [bookings] = useState(() => getBookings())
  const userBookings = user ? bookings.filter((booking) => booking.userId === user.id) : []
  if (!user || user.role !== 'renter') return <main className="portal-auth-required"><section><span className="portal-auth-badge">RENTER ACCOUNT</span><h1>Sign in to view your trips</h1><p>Reservations and trip details are saved to your renter account on this browser.</p><a className="portal-button" href="/login">Renter sign in <ArrowRight size={15} /></a><a className="portal-secondary-link" href="/signup">Create an account</a></section></main>
  const totalSpend = userBookings.filter((booking) => booking.status !== 'cancelled').reduce((sum, booking) => sum + Number(booking.total || 0), 0)
  return <PortalFrame user={user} roleLabel="Renter" section="My trips" sections={['My trips']} onSectionChange={() => {}} onSignOut={() => { signOut(); window.location.href = '/' }}>
    <div className="portal-content"><PortalHeading eyebrow="RENTER DASHBOARD" title={`Welcome back, ${user.name.split(' ')[0]}`} copy="Your reservations, trip status, and rental details in one place." action={<a className="portal-button" href="/fleet">Browse the fleet <ArrowRight size={15} /></a>} />
      <div className="portal-metrics"><MetricCard icon={CarFront} label="Total trips" value={userBookings.length} note="Your Voltigo reservations" /><MetricCard icon={ClipboardList} label="Upcoming trips" value={userBookings.filter((booking) => ['pending', 'confirmed'].includes(booking.status)).length} note="Pending or confirmed" /><MetricCard icon={CircleDollarSign} label="Trip spend" value={`$${totalSpend.toLocaleString()}`} note="Excluding cancelled reservations" /></div>
      <div className="portal-section-title"><div><h2>My reservations</h2><p>Get in touch with support if you need to change a trip.</p></div></div>
      {!userBookings.length ? <section className="portal-empty-state"><span><CarFront size={22} /></span><h2>No trips yet</h2><p>When you book a vehicle, your reservation and status will show here.</p><a className="portal-button" href="/fleet">Explore the fleet</a></section> : <div className="portal-trip-list">{userBookings.map((booking) => <article className="portal-trip-card" key={booking.id}><div className="portal-trip-image"><img src={imageUrl(booking.vehicleImage, 450)} alt={booking.vehicleName} /></div><div className="portal-trip-details"><div className="portal-trip-title"><div><small>{booking.vehicleCategory} · ${booking.total} total</small><h3>{booking.vehicleName}</h3></div><span className={`portal-status-badge ${booking.status}`}>{booking.status}</span></div><p>{booking.start ? new Date(booking.start).toLocaleString() : 'Pickup date pending'} — {booking.end ? new Date(booking.end).toLocaleString() : 'Return date pending'}</p><p>{booking.pickup} → {booking.dropoff}</p></div></article>)}</div>}
    </div>
  </PortalFrame>
}

function PortalField({ name, label, placeholder, type = 'text', accept }) {
  return <label className="portal-field">{label}<input name={name} type={type} placeholder={placeholder} accept={accept} min={type === 'number' ? '1' : undefined} required /></label>
}

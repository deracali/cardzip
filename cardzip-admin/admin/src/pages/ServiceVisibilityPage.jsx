import { useEffect, useState } from 'react'
import { adminApi } from '../services/api'
import CardzipLoader from '../components/CardzipLoader'
import './ServiceVisibilityPage.css'

export default function ServiceVisibilityPage() {
  const [settings, setSettings] = useState({ esimEnabled: true, vtpassBillsEnabled: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    adminApi.featureSettings()
      .then((result) => {
        if (active) setSettings(result.data)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Could not load service availability.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const saveSettings = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const result = await adminApi.updateFeatureSettings(settings)
      setSettings(result.data)
      setSaved(true)
    } catch (saveError) {
      setError(saveError.message || 'Could not save service availability.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CardzipLoader label="Loading service availability…" />

  return (
    <section className="section-card service-visibility-page">
      <div>
        <h1>Service visibility</h1>
        <p>Hide services across the website and mobile app. Disabled services are also blocked by the API.</p>
      </div>
      {error && <div className="service-visibility-message error" role="alert">{error}</div>}
      {saved && <div className="service-visibility-message success" role="status">Service availability saved.</div>}
      <form onSubmit={saveSettings}>
        <label className="service-visibility-option">
          <input
            type="checkbox"
            checked={!settings.esimEnabled}
            onChange={(event) => setSettings((current) => ({ ...current, esimEnabled: !event.target.checked }))}
          />
          <span>
            <strong>Hide eSIM / virtual numbers</strong>
            <small>Remove the eSIM page and entry points from the website and app, and block virtual-number APIs.</small>
          </span>
        </label>
        <label className="service-visibility-option">
          <input
            type="checkbox"
            checked={!settings.vtpassBillsEnabled}
            onChange={(event) => setSettings((current) => ({ ...current, vtpassBillsEnabled: !event.target.checked }))}
          />
          <span>
            <strong>Hide VTPass bill payments</strong>
            <small>Hide bill-payment entry points and block VTPass bill lookup and payment APIs.</small>
          </span>
        </label>
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </section>
  )
}

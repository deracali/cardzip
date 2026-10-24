import { useState } from 'react'
import {
  Settings as SettingsIcon,
  Cpu,
  Shield,
  Key,
  Sliders,
  Save,
  CheckCircle2,
} from 'lucide-react'



export default function Settings() {
  const [saved, setSaved] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an expert Real Estate AI assistant. Generate compelling, high-converting property descriptions highlighting key architectural details and modern amenities.'
  )
  const [starterCredits, setStarterCredits] = useState(50)
  const [proCredits, setProCredits] = useState(200)
  const [brokerageCredits, setBrokerageCredits] = useState(500)
  const [rateLimit, setRateLimit] = useState(60)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="settings-container space-y-6">
      {/* Header */}
      <div className="settings-header">
        <div>
          <div className="header-title-wrapper">
            <SettingsIcon className="text-emerald-400" size={24} />
            <h1 className="header-title">
              Admin & Global System Settings
            </h1>
          </div>
          <p className="header-description">
            Configure default credit allowances, rate limits, and global Gemini API prompt behavior.
          </p>
        </div>

        <button onClick={handleSave} className="btn-save">
          <Save size={14} /> Save Changes
        </button>
      </div>

      {saved && (
        <div className="alert-success">
          <CheckCircle2 size={16} /> Global settings updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="settings-form space-y-6">
        {/* Section 1: AI Prompt & Model Defaults */}
        <div className="settings-card space-y-4">
          <div className="card-title">
            <Cpu size={18} className="text-violet-400" /> AI System Instructions & Prompt Base
          </div>
          <div>
            <label className="field-label">
              Global System Instruction (Prepended to all Gemini Requests)
            </label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="settings-textarea"
            />
          </div>
        </div>

        {/* Section 2: Default Credit Allocations */}
        <div className="settings-card space-y-4">
          <div className="card-title">
            <Sliders size={18} className="text-blue-400" /> Default Monthly Plan Credit Allocations
          </div>
          <div className="grid-3-col">
            <div>
              <label className="field-label">Starter Tier ($39)</label>
              <input
                type="number"
                value={starterCredits}
                onChange={(e) => setStarterCredits(Number(e.target.value))}
                className="settings-input"
              />
            </div>
            <div>
              <label className="field-label">Pro Tier ($89)</label>
              <input
                type="number"
                value={proCredits}
                onChange={(e) => setProCredits(Number(e.target.value))}
                className="settings-input"
              />
            </div>
            <div>
              <label className="field-label">Brokerage Tier ($249)</label>
              <input
                type="number"
                value={brokerageCredits}
                onChange={(e) => setBrokerageCredits(Number(e.target.value))}
                className="settings-input"
              />
            </div>
          </div>
        </div>

        {/* Section 3: API Security & Rate Limits */}
        <div className="settings-card space-y-4">
          <div className="card-title">
            <Shield size={18} className="text-emerald-400" /> Rate Limits & Protection
          </div>
          <div className="grid-2-col">
            <div>
              <label className="field-label">
                Max Generations Per Minute (Per User)
              </label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
                className="settings-input"
              />
            </div>
            <div>
              <label className="field-label">
                Gemini API Key Status
              </label>
              <div className="key-status-display">
                <Key size={14} className="text-emerald-400" /> AI_GEMINI_KEY_••••9A2B (Active)
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
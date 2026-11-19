import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5400/api'
const urlMode = new URLSearchParams(window.location.search).get('mode')
const savedMode = window.localStorage.getItem('pulselive-mode')
const mode = urlMode === 'api' ? 'api' : savedMode === 'api' ? 'api' : 'local'

if (savedMode !== mode) window.localStorage.setItem('pulselive-mode', mode)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App mode={mode} apiBaseUrl={apiBaseUrl} />
  </StrictMode>,
)

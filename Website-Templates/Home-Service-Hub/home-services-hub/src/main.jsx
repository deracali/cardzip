import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App apiBaseUrl={import.meta.env.VITE_HOME_SERVICE_API_URL || 'http://localhost:5200/api'} />
  </StrictMode>,
)

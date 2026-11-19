import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FoodApp from './FoodApp.jsx'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FoodApp apiBaseUrl={apiBaseUrl} />
  </StrictMode>,
)

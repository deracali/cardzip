import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RentalApp from './RentalApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RentalApp />
  </StrictMode>,
)

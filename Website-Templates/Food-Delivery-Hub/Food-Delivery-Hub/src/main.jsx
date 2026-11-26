import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FoodApp from './FoodApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FoodApp />
  </StrictMode>,
)

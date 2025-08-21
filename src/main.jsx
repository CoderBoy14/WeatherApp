import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import WeatherApp from './WeatherApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WeatherApp />
  </StrictMode>,
)

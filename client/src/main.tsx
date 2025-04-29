import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Import mock APIs for development mode
import './api/auth'
import './api/products'

// Set a flag to show this is using mock data
if (import.meta.env.DEV) {
  console.log('%c🧪 Using mock data API - No server connection required', 'background: #ff9800; color: white; padding: 4px; border-radius: 4px; font-weight: bold;');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from 'axios'

// Configure Axios defaults for all requests
axios.defaults.withCredentials = true;

// We're using Vite's proxy for API requests
// The proxy in vite.config.ts forwards all /api requests to http://localhost:3000

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

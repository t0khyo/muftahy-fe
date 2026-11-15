import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@workspace/ui/globals.css'
import './index.css'
import { App } from './App'

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => console.error('[GLOBAL ERROR]', e.message, e.error?.stack))
  window.addEventListener('unhandledrejection', (e) => console.error('[UNHANDLED REJECTION]', e.reason))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

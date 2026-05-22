import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { init } from './utils/telemetry'

if (import.meta.env.VITE_SECURITY_ENABLED !== 'false') {
  init()
}

// Disable tab key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') e.preventDefault();
});

createRoot(document.getElementById('root')!).render(<App />)

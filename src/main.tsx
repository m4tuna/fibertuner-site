import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import DownloadsPage from './DownloadsPage'
import PrivacyPage from './PrivacyPage'

const path = window.location.pathname.replace(/\/$/, '') || '/'
const root =
  path === '/downloads' ? <DownloadsPage /> :
  path === '/privacy'   ? <PrivacyPage /> :
  <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {root}
  </StrictMode>,
)

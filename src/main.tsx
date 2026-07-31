import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import DownloadsPage from './DownloadsPage'
import PrivacyPage from './PrivacyPage'
import SharePage from './pages/SharePage'
import BroadcastPage from './pages/BroadcastPage'
import StatsPage from './pages/StatsPage'

const path = window.location.pathname.replace(/\/$/, '') || '/'
const root =
  path === '/downloads'              ? <DownloadsPage /> :
  path === '/privacy'                ? <PrivacyPage /> :
  path === '/share'                  ? <SharePage /> :
  path === '/stats'                  ? <StatsPage /> :
  path.startsWith('/broadcast')      ? <BroadcastPage /> :
  <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {root}
  </StrictMode>,
)

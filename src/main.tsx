import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import DownloadsPage from './DownloadsPage'
import PrivacyPage from './PrivacyPage'
import MobilePrivacyPage from './MobilePrivacyPage'
import SharePage from './pages/SharePage'
import BroadcastPage from './pages/BroadcastPage'
import StatsPage from './pages/StatsPage'
import DemoPage from './pages/DemoPage'
import ChangelogPage from './pages/ChangelogPage'
import BetaPage from './pages/BetaPage'

const path   = window.location.pathname.replace(/\/$/, '') || '/'
const search = new URLSearchParams(window.location.search)
const root =
  path === '/downloads' && search.has('stats') ? <StatsPage /> :
  path === '/downloads'              ? <DownloadsPage /> :
  path === '/privacy'                ? <PrivacyPage /> :
  path === '/privacy-policy'         ? <MobilePrivacyPage /> :
  path === '/share'                  ? <SharePage /> :
  path === '/stats'                  ? <StatsPage /> :
  path === '/demo'                   ? <DemoPage /> :
  path === '/changelog'              ? <ChangelogPage /> :
  path === '/beta'                   ? <BetaPage /> :
  path.startsWith('/broadcast')      ? <BroadcastPage /> :
  <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {root}
  </StrictMode>,
)

import { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import '../styles/changelog.css'

const GITHUB = 'm4tuna/fibertuner-site'

interface ChangelogEntry {
  version: string
  date: string
  notes: string
}

/** Compare semver strings. Returns negative if a < b, 0 if equal, positive if a > b. */
function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

function parseChangelog(md: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = []
  // Match ## [VERSION] - DATE headers
  const headerRe = /^## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2})\s*$/gm
  const lines = md.split('\n')
  const headers: { version: string; date: string; lineIdx: number }[] = []

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2})\s*$/)
    if (m) {
      headers.push({ version: m[1], date: m[2], lineIdx: i })
    }
  }

  for (let h = 0; h < headers.length; h++) {
    const { version, date, lineIdx } = headers[h]
    const endLine = h + 1 < headers.length ? headers[h + 1].lineIdx : lines.length
    const notes = lines.slice(lineIdx + 1, endLine).join('\n').trim()
    if (notes) entries.push({ version, date, notes })
  }

  // Suppress unused import warning
  void headerRe

  return entries
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Hand-rolled markdown renderer for changelog notes.
 *  Handles: ### subheaders, - bullets, **bold**, `code`, plain paragraphs.
 */
function renderNotes(notes: string) {
  const lines = notes.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  function renderInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = []
    const re = /\*\*([^*]+)\*\*|`([^`]+)`/g
    let last = 0
    let m: RegExpExecArray | null
    let key = 0
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index))
      if (m[1] !== undefined) parts.push(<strong key={key++}>{m[1]}</strong>)
      else if (m[2] !== undefined) parts.push(<code key={key++} className="cl-code">{m[2]}</code>)
      last = m.index + m[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return parts
  }

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      elements.push(
        <div key={i} className="cl-subheader">{line.slice(4)}</div>
      )
      i++
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      // Collect consecutive bullet lines
      const bullets: React.ReactNode[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        bullets.push(
          <li key={i} className="cl-bullet">{renderInline(lines[i].slice(2))}</li>
        )
        i++
      }
      elements.push(<ul key={`ul-${i}`} className="cl-list">{bullets}</ul>)
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    // Plain paragraph (e.g. **Full Changelog**: URL)
    elements.push(
      <p key={i} className="cl-para">{renderInline(line)}</p>
    )
    i++
  }

  return elements
}

export default function ChangelogPage() {
  const [allEntries, setAllEntries] = useState<ChangelogEntry[] | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)

  // Read ?from= and ?to= from the URL
  const params = new URLSearchParams(window.location.search)
  const fromVersion = params.get('from') ?? ''
  const toVersion   = params.get('to') ?? ''

  useEffect(() => {
    fetch('/CHANGELOG.md')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      })
      .then(md => {
        setAllEntries(parseChangelog(md))
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  // Apply version range filter when params are present
  const entries = allEntries
    ? (fromVersion || toVersion)
      ? allEntries.filter(e => {
          const geFrom = !fromVersion || compareSemver(e.version, fromVersion) > 0
          const leTo   = !toVersion   || compareSemver(e.version, toVersion)   <= 0
          return geFrom && leTo
        })
      : allEntries
    : null

  const isDiffView = Boolean(fromVersion || toVersion)

  function clearFilter() {
    window.history.replaceState(null, '', window.location.pathname)
    // Force a re-render by navigating to the base URL (simplest approach in a static SPA)
    window.location.href = window.location.pathname
  }

  return (
    <div className="changelog-page">
      <header className="site-header">
        <a href="/" className="site-header__logo">Fibertuner</a>
        <nav className="site-header__nav">
          <a href="/downloads" className="site-header__link">Downloads</a>
          <a href="/changelog" className="site-header__link site-header__link--active">Changelog</a>
        </nav>
      </header>

      <div className="changelog-body">
        <div className="changelog-gradient" />
        <div className="changelog-inner">
          <p className="changelog-eyebrow">Release history</p>
          <h1 className="changelog-title">Changelog</h1>
          <p className="changelog-subtitle">
            Every notable change to Fibertuner, most recent first.
          </p>

          {/* Diff-range banner */}
          {isDiffView && !loading && !error && (
            <div className="cl-diff-banner">
              <span className="cl-diff-banner__text">
                {toVersion
                  ? <>Showing changes from v{fromVersion} to v{toVersion}</>
                  : <>Showing changes since v{fromVersion}</>
                }
              </span>
              <button
                className="cl-diff-banner__dismiss"
                onClick={clearFilter}
                aria-label="View all versions"
              >
                × View all
              </button>
            </div>
          )}

          {loading && (
            <div className="changelog-loading">Loading…</div>
          )}

          {error && (
            <div className="changelog-error">
              Could not load changelog.{' '}
              <a
                href="https://github.com/m4tuna/fibertuner/releases"
                target="_blank"
                rel="noopener"
                className="changelog-error-link"
              >
                See GitHub Releases ↗
              </a>
            </div>
          )}

          {entries !== null && entries.length === 0 && !loading && (
            <div className="changelog-loading">
              {isDiffView ? 'No releases found in this range.' : 'No releases yet.'}
            </div>
          )}

          {entries && entries.length > 0 && (
            <div className="changelog-entries">
              {entries.map(entry => (
                <div key={entry.version} className="cl-card">
                  <div className="cl-card__header">
                    <span className="cl-card__version">v{entry.version}</span>
                    <span className="cl-card__date">{formatDate(entry.date)}</span>
                  </div>
                  <div className="cl-card__notes">
                    {renderNotes(entry.notes)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer appName="Fibertuner" githubRepo={GITHUB} />
    </div>
  )
}

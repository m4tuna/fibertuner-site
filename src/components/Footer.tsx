interface Props {
  appName: string
  githubRepo?: string
}

export default function Footer({ appName, githubRepo }: Props) {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '28px 40px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
        © {new Date().getFullYear()} {appName}
      </span>
      <div style={{ display: 'flex', gap: 22 }}>
        {githubRepo && (
          <a
            href={`https://github.com/${githubRepo}`}
            target="_blank" rel="noopener"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
          >
            GitHub
          </a>
        )}
        <a
          href="https://github.com/m4tuna"
          target="_blank" rel="noopener"
          style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
        >
          @m4tuna
        </a>
      </div>
    </footer>
  )
}

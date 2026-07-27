interface Props {
  appName: string
  githubRepo?: string
}

export default function Footer({ appName, githubRepo }: Props) {
  return (
    <footer className="site-footer">
      <span className="site-footer__copy">
        © {new Date().getFullYear()} {appName}
      </span>
      <div className="site-footer__links">
        <a href="/privacy" className="site-footer__link">Privacy</a>
        {githubRepo && (
          <a
            href={`https://github.com/${githubRepo}`}
            target="_blank"
            rel="noopener"
            className="site-footer__link"
          >
            GitHub
          </a>
        )}
        <a
          href="https://github.com/m4tuna"
          target="_blank"
          rel="noopener"
          className="site-footer__link"
        >
          @m4tuna
        </a>
      </div>
    </footer>
  )
}

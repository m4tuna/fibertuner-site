interface Props {
  appName: string
}

export default function Footer({ appName }: Props) {
  return (
    <footer className="site-footer">
      <span className="site-footer__copy">
        © {new Date().getFullYear()} {appName}
      </span>
      <div className="site-footer__links">
        <a href="/privacy" className="site-footer__link">Privacy</a>
      </div>
    </footer>
  )
}

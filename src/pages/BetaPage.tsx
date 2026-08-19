import { useState } from 'react'
import Footer from '../components/Footer'
import '../index.css'

const GITHUB = 'm4tuna/fibertuner'

export default function BetaPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="site-header">
        <a href="/" className="site-header__logo">Fibertuner</a>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px 80px' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>

          <p style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
            marginBottom: 20,
          }}>
            Beta
          </p>

          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Join the iOS beta.
          </h1>

          <p style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.75,
            marginBottom: 48,
            maxWidth: 400,
          }}>
            Fibertuner for iPhone is in private beta. Sign up and we'll send
            you a TestFlight invite when a spot opens up.
          </p>

          {submitted ? (
            <div style={{
              padding: '28px 32px',
              borderRadius: 14,
              background: 'color-mix(in srgb, var(--accent) 8%, rgba(255,255,255,0.04))',
              border: '1px solid color-mix(in srgb, var(--accent) 28%, transparent)',
            }}>
              <p style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.88)',
                marginBottom: 8,
              }}>
                You're on the list!
              </p>
              <p style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.6,
              }}>
                We'll send your TestFlight invite soon.
              </p>
            </div>
          ) : (
            <form
              name="beta-signup"
              method="POST"
              {...{ 'data-netlify': 'true' } as React.FormHTMLAttributes<HTMLFormElement>}
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <input type="hidden" name="form-name" value="beta-signup" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first-name"
                    required
                    placeholder="Jane"
                    style={{
                      padding: '11px 14px',
                      borderRadius: 9,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.88)',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                      width: '100%',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent) 50%, transparent)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last-name"
                    required
                    placeholder="Smith"
                    style={{
                      padding: '11px 14px',
                      borderRadius: 9,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.88)',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                      width: '100%',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent) 50%, transparent)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)',
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="jane@example.com"
                  style={{
                    padding: '11px 14px',
                    borderRadius: 9,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.88)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    width: '100%',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent) 50%, transparent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#f87171', marginTop: -4 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: 8,
                  padding: '13px 24px',
                  borderRadius: 10,
                  background: 'var(--accent)',
                  color: 'var(--bg)',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  border: 'none',
                  cursor: submitting ? 'default' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  transition: 'opacity 0.15s',
                  width: '100%',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.82' }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.opacity = '1' }}
              >
                {submitting ? 'Signing up…' : 'Request Access'}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer appName="Fibertuner" githubRepo={GITHUB} />
    </div>
  )
}

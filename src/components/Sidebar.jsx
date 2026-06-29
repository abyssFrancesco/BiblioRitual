import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Sidebar({ onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const goTo = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    setMobileOpen(false)
    await onLogout()
  }

  return (
    <>
      <div className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Apri menu"
        >
          <span />
          <span />
          <span />
        </button>

        <span className="mobile-topbar-logo">BiblioRitual</span>

        <div
          className="avatar-initials"
          style={{ width: '36px', height: '36px', fontSize: '13px' }}
        >
          FM
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-fullscreen-menu">
          <div className="mobile-menu-panel">
            <div className="mobile-menu-top">
              <div className="mobile-menu-user">
                <div className="mobile-avatar-large">FM</div>
                <div>
                  <p className="mobile-user-name">Francesco Maria</p>
                  <p className="mobile-user-subtitle">La mia libreria</p>
                </div>
              </div>

              <button
                className="mobile-menu-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Chiudi menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-menu-center">
              <button
                className={`mobile-menu-link ${location.pathname === '/' ? 'active' : ''}`}
                onClick={() => goTo('/')}
              >
                My Library
              </button>

              <button
                className={`mobile-menu-link ${location.pathname === '/stats' ? 'active' : ''}`}
                onClick={() => goTo('/stats')}
              >
                Stats
              </button>

              <button
                className={`mobile-menu-link ${location.pathname === '/discover' ? 'active' : ''}`}
                onClick={() => goTo('/discover')}
              >
                Discover
              </button>

              <button
                className={`mobile-menu-link ${location.pathname === '/settings' ? 'active' : ''}`}
                onClick={() => goTo('/settings')}
              >
                Settings
              </button>
            </div>

            <div className="mobile-menu-bottom">
              <button
                className="mobile-logout-btn"
                onClick={handleLogout}
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="sidebar">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div className="avatar-initials">FM</div>
          <div className="sidebar-user-name">
            <p style={{ fontWeight: '700', fontSize: '14px', lineHeight: 1.2 }}>
              Francesco Maria
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              La mia libreria
            </p>
          </div>
        </div>

        <div className="sidebar-brand-block">
          <p className="sidebar-brand-kicker">Reading space</p>
          <p className="sidebar-brand-title">BiblioRitual</p>
        </div>

        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--color-outline-variant)',
            marginBottom: '20px',
          }}
        />

        <nav
          className="sidebar-nav"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <button
            className={`btn-ghost ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => goTo('/')}
          >
            <span style={{ fontSize: '18px' }}>📚</span>
            My Library
          </button>

          <button
            className={`btn-ghost ${location.pathname === '/stats' ? 'active' : ''}`}
            onClick={() => goTo('/stats')}
          >
            <span style={{ fontSize: '18px' }}>📊</span>
            Stats
          </button>

          <button
            className={`btn-ghost ${location.pathname === '/discover' ? 'active' : ''}`}
            onClick={() => goTo('/discover')}
          >
            <span style={{ fontSize: '18px' }}>✨</span>
            Discover
          </button>

          <button
            className={`btn-ghost ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => goTo('/settings')}
          >
            <span style={{ fontSize: '18px' }}>⚙️</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-bottom" style={{ marginTop: 'auto' }}>
          <hr
            style={{
              border: 'none',
              borderTop: '1px solid var(--color-outline-variant)',
              marginBottom: '12px',
            }}
          />
          <button
            className="btn-ghost"
            onClick={handleLogout}
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span style={{ fontSize: '16px' }}>↩</span>
            Esci
          </button>
        </div>
      </aside>
    </>
  )
}
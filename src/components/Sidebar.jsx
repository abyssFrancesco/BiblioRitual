import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Sidebar({ onLogout, onAddBook }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const goTo = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  return (
    <>
      {/* MOBILE TOPBAR */}
      <div className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Apri menu"
        >
          ☰
        </button>

        <span className="mobile-topbar-logo">BiblioRitual</span>

        <div className="avatar-initials" style={{ width: '36px', height: '36px', fontSize: '13px' }}>
          FM
        </div>
      </div>

      {/* MOBILE FULLSCREEN MENU */}
      {mobileOpen && (
        <div className="mobile-fullscreen-menu">
          <div className="mobile-menu-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
              className="mobile-menu-link"
              onClick={() => {
                onAddBook()
                setMobileOpen(false)
              }}
            >
              + Aggiungi libro
            </button>
          </div>

          <div className="mobile-menu-bottom">
            <button
              className="mobile-logout-btn"
              onClick={() => {
                setMobileOpen(false)
                onLogout()
              }}
            >
              Esci
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div className="avatar-initials">FM</div>
          <div className="sidebar-user-name">
            <p style={{ fontWeight: '700', fontSize: '14px', lineHeight: 1.2 }}>Francesco Maria</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>La mia libreria</p>
          </div>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
            fontWeight: '700',
            fontStyle: 'italic',
            color: 'var(--color-primary)',
            marginBottom: '8px',
            letterSpacing: '0.02em',
          }}
          className="sidebar-desktop-logo"
        >
          BiblioRitual
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '20px' }} />

        <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            className={`btn-ghost ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <span style={{ fontSize: '18px' }}>📚</span>
            My Library
          </button>

          <button className="btn-ghost" onClick={onAddBook}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '700',
                flexShrink: 0,
              }}
            >
              +
            </span>
            Aggiungi libro
          </button>
        </nav>

        <div className="sidebar-bottom" style={{ marginTop: 'auto' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '12px' }} />
          <button className="btn-ghost" onClick={onLogout} style={{ color: 'var(--color-text-muted)' }}>
            <span style={{ fontSize: '16px' }}>↩</span>
            Esci
          </button>
        </div>
      </aside>
    </>
  )
}
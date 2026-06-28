import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ onLogout }) {
  const location = useLocation()

  const linkStyle = (path) => ({
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    color: location.pathname === path ? 'var(--color-primary)' : 'var(--color-text-muted)',
    borderBottom: location.pathname === path ? '2px solid var(--color-primary)' : '2px solid transparent',
    paddingBottom: '2px',
    transition: 'color 180ms ease',
  })

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-surface-highest)',
      height: '60px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px',
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '22px', fontWeight: '700',
          color: 'var(--color-primary)', fontStyle: 'italic',
        }}>BiblioRitual</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={linkStyle('/')}>Home</Link>
        <Link to="/library" style={linkStyle('/library')}>Libreria</Link>
        <button onClick={onLogout} style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px', fontWeight: '600',
          background: 'none', border: 'none',
          color: 'var(--color-outline)', cursor: 'pointer',
          transition: 'color 180ms ease',
        }}
        onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
        onMouseLeave={e => e.target.style.color = 'var(--color-outline)'}
        >Esci</button>
      </div>
    </nav>
  )
}
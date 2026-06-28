import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'toread',  label: 'Da leggere', emoji: '📌' },
  { value: 'reading', label: 'In lettura',  emoji: '📖' },
  { value: 'read',    label: 'Letto',       emoji: '✅' },
]

export default function BookModal({ book, onClose, onRatingChange, onStatusChange, onRemove }) {
  const [showFullDesc, setShowFullDesc] = useState(false)

  if (!book) return null

  // Usa cover di alta qualità con -L
  const cover = book.cover_id
    ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`
    : null

  // Tronca descrizione alla fine dell'ultima frase entro 200 chars
  const getShortDesc = (text) => {
    if (!text || text.length <= 200) return text
    const cut = text.slice(0, 200)
    const lastDot = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'))
    return lastDot > 80 ? cut.slice(0, lastDot + 1) : cut + '...'
  }

  const shortDesc = getShortDesc(book.description)
  const hasMore = book.description && book.description.length > shortDesc?.length

  const handleRemove = () => { onRemove(book.id); onClose() }

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .modal-body::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="modal-overlay" onClick={onClose}
        style={{ alignItems: 'flex-end', padding: 0 }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            width: '100%', maxWidth: '600px',
            margin: '0 auto',
            maxHeight: '92dvh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 280ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Hero — fisso, non scrolla */}
          <div style={{
            width: '100%', height: '260px',
            background: 'linear-gradient(135deg, #1e3d2a, #3a7a52)',
            position: 'relative', flexShrink: 0,
            display: 'flex', alignItems: 'flex-end',
            padding: '24px', gap: '20px',
          }}>
            <button onClick={onClose} style={{
              position: 'absolute', top: '16px', right: '16px',
              width: '32px', height: '32px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0,0,0,0.35)',
              border: 'none', color: 'white', fontSize: '16px',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>✕</button>

            {/* Copertina alta qualità */}
            <div style={{
              width: '100px', minWidth: '100px', height: '150px',
              borderRadius: 'var(--radius-md)', overflow: 'hidden',
              boxShadow: '6px 8px 28px rgba(0,0,0,0.5)',
              background: 'rgba(255,255,255,0.1)', flexShrink: 0,
            }}>
              {cover
                ? <img
                    src={cover}
                    alt={book.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                  />
                : <div style={{ width: '100%', height: '100%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>📖</div>
              }
            </div>

            <div style={{ paddingBottom: '4px', flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '6px',
              }}>
                {STATUS_OPTIONS.find(o => o.value === book.status)?.emoji}{' '}
                {STATUS_OPTIONS.find(o => o.value === book.status)?.label}
              </p>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '700',
                color: '#fff', lineHeight: 1.3, marginBottom: '6px',
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              }}>{book.title}</h2>
              <p style={{
                fontFamily: 'var(--font-serif)', fontSize: '13px',
                fontStyle: 'italic', color: 'rgba(255,255,255,0.65)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{book.author}</p>
            </div>
          </div>

          {/* Corpo — scrolla senza scrollbar visibile */}
          <div className="modal-body" style={{ overflowY: 'auto', padding: '28px', scrollbarWidth: 'none' }}>

            {/* Rating */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                Valutazione
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1,2,3,4,5].map(star => (
                  <button key={star}
                    onClick={() => onRatingChange(book.id, star === book.rating ? 0 : star)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '28px', padding: '2px',
                      filter: star <= book.rating ? 'none' : 'grayscale(1) opacity(0.3)',
                      transition: 'filter 150ms ease, transform 150ms ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >⭐</button>
                ))}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '24px' }} />

            {/* Status */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                Stato
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {STATUS_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => onStatusChange(book.id, opt.value)}
                    style={{
                      flex: 1, padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: book.status === opt.value
                        ? '2px solid var(--color-primary)'
                        : '2px solid var(--color-outline-variant)',
                      background: book.status === opt.value
                        ? 'var(--color-primary-light)' : 'transparent',
                      color: book.status === opt.value
                        ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      fontFamily: 'var(--font-sans)', fontSize: '12px',
                      fontWeight: '700', cursor: 'pointer',
                      transition: 'all 150ms ease',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Descrizione */}
            {book.description && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '24px' }} />
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                    Descrizione
                  </p>
                  <p style={{ fontSize: '14px', lineHeight: 1.75, color: 'var(--color-text)' }}>
                    {showFullDesc ? book.description : shortDesc}
                  </p>
                  {hasMore && (
                    <button
                      onClick={() => setShowFullDesc(v => !v)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-primary)', fontSize: '13px',
                        fontWeight: '700', marginTop: '8px', padding: 0,
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {showFullDesc ? '↑ Mostra meno' : 'Leggi tutto →'}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Rimuovi */}
            <button onClick={handleRemove} style={{
              width: '100%', padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid #ffcdd2',
              background: 'transparent', color: '#c0392b',
              fontFamily: 'var(--font-sans)', fontSize: '13px',
              fontWeight: '700', cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >🗑 Rimuovi dalla libreria</button>
          </div>
        </div>
      </div>
    </>
  )
}
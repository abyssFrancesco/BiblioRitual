import { useEffect, useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'toread', label: 'Da leggere', emoji: '📌' },
  { value: 'reading', label: 'In lettura', emoji: '📖' },
  { value: 'read', label: 'Letto', emoji: '✅' },
]

export default function BookModal({ book, onClose, onRatingChange, onStatusChange, onRemove }) {
  const [showFullDesc, setShowFullDesc] = useState(false)

  useEffect(() => {
    setShowFullDesc(false)
  }, [book])

  if (!book) return null

  const coverId = book.cover_id || book.coverId

  const cover = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    : null

  const getShortDesc = (text) => {
    if (!text || text.length <= 220) return text
    const cut = text.slice(0, 220)
    const lastDot = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'))
    return lastDot > 80 ? cut.slice(0, lastDot + 1) : cut + '...'
  }

  const shortDesc = getShortDesc(book.description)
  const hasMore = book.description && book.description.length > shortDesc?.length

  const handleRemove = () => {
    onRemove(book.id)
    onClose()
  }

  return (
    <>
      <style>{`
        @keyframes slideUpPremium {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-body::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="modal-overlay"
        onClick={onClose}
        style={{
          alignItems: 'flex-end',
          padding: 0,
          backdropFilter: 'blur(4px)',
          background: 'rgba(0,0,0,0.32)',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--color-surface)',
            borderRadius: '28px 28px 0 0',
            width: '100%',
            maxWidth: '640px',
            margin: '0 auto',
            maxHeight: '92dvh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUpPremium 420ms cubic-bezier(0.22, 1, 0.36, 1)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.14)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '270px',
              background: 'linear-gradient(135deg, #1f4b33 0%, #2d5a3d 70%, #3a7a52 100%)',
              position: 'relative',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'flex-end',
              padding: '24px',
              gap: '20px',
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '34px',
                height: '34px',
                borderRadius: '9999px',
                background: 'rgba(0,0,0,0.26)',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1), background 260ms ease-out',
              }}
            >
              ✕
            </button>

            <div
              style={{
                width: '108px',
                minWidth: '108px',
                height: '158px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(0,0,0,0.38)',
                background: 'rgba(255,255,255,0.1)',
                flexShrink: 0,
              }}
            >
              {cover ? (
                <img
                  src={cover}
                  alt={book.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                  }}
                >
                  📖
                </div>
              )}
            </div>

            <div style={{ paddingBottom: '6px', flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.56)',
                  marginBottom: '8px',
                }}
              >
                {STATUS_OPTIONS.find(o => o.value === book.status)?.emoji} {STATUS_OPTIONS.find(o => o.value === book.status)?.label}
              </p>

              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#fff',
                  lineHeight: 1.22,
                  marginBottom: '8px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {book.title}
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.72)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {book.author}
              </p>
            </div>
          </div>

          <div className="modal-body" style={{ overflowY: 'auto', padding: '28px', scrollbarWidth: 'none' }}>
            <div style={{ marginBottom: '24px' }}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: '10px',
                }}
              >
                Valutazione
              </p>

              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => onRatingChange(book.id, star === book.rating ? 0 : star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '29px',
                      padding: '2px',
                      filter: star <= book.rating ? 'none' : 'grayscale(1) opacity(0.3)',
                      transition: 'filter 260ms ease-out, transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.14)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '24px' }} />

            <div style={{ marginBottom: '24px' }}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: '10px',
                }}
              >
                Stato
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onStatusChange(book.id, opt.value)}
                    style={{
                      flex: '1 1 120px',
                      padding: '12px 10px',
                      borderRadius: '12px',
                      border: book.status === opt.value
                        ? '2px solid var(--color-primary)'
                        : '1.5px solid var(--color-outline-variant)',
                      background: book.status === opt.value
                        ? 'var(--color-primary-light)'
                        : 'transparent',
                      color: book.status === opt.value
                        ? 'var(--color-primary)'
                        : 'var(--color-text-muted)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {(book.year || book.pages || (Array.isArray(book.genres) && book.genres.length > 0)) && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '24px' }} />

                <div style={{ marginBottom: '24px' }}>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      marginBottom: '10px',
                    }}
                  >
                    Dettagli
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {book.year && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Anno</span>
                        <span style={{ color: 'var(--color-text)', fontSize: '14px', fontWeight: '600' }}>
                          {book.year}
                        </span>
                      </div>
                    )}

                    {book.pages && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Pagine</span>
                        <span style={{ color: 'var(--color-text)', fontSize: '14px', fontWeight: '600' }}>
                          {book.pages}
                        </span>
                      </div>
                    )}

                    {Array.isArray(book.genres) && book.genres.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Genere</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {book.genres.map((genre, i) => (
                            <span
                              key={`${genre}-${i}`}
                              style={{
                                background: 'var(--color-primary-light)',
                                color: 'var(--color-primary)',
                                borderRadius: '9999px',
                                padding: '6px 10px',
                                fontSize: '12px',
                                fontWeight: '700',
                                lineHeight: 1,
                              }}
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {book.description && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '24px' }} />

                <div style={{ marginBottom: '26px' }}>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      marginBottom: '10px',
                    }}
                  >
                    Descrizione
                  </p>

                  <p
                    style={{
                      fontSize: '15px',
                      lineHeight: 1.8,
                      color: 'var(--color-text)',
                    }}
                  >
                    {showFullDesc ? book.description : shortDesc}
                  </p>

                  {hasMore && (
                    <button
                      onClick={() => setShowFullDesc(v => !v)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-primary)',
                        fontSize: '13px',
                        fontWeight: '700',
                        marginTop: '10px',
                        padding: 0,
                        fontFamily: 'var(--font-sans)',
                        transition: 'color 220ms ease-out, transform 220ms ease-out',
                      }}
                    >
                      {showFullDesc ? '↑ Mostra meno' : 'Leggi tutto →'}
                    </button>
                  )}
                </div>
              </>
            )}

            <button
              onClick={handleRemove}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                border: '1.5px solid #f3c7c7',
                background: 'transparent',
                color: '#c0392b',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'background 280ms ease-out, transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#fff5f5'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              🗑 Rimuovi dalla libreria
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
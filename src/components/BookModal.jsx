import { useEffect, useState } from 'react'
import { useBookNotes } from '../hooks/useBookNotes'

const STATUS_OPTIONS = [
  { value: 'toread', label: 'Da leggere', emoji: '📌' },
  { value: 'reading', label: 'In lettura', emoji: '📖' },
  { value: 'read', label: 'Letto', emoji: '✅' },
  { value: 'dnf', label: 'Interrotto', emoji: '⛔' },
]

function StarRating({ value = 0, onChange }) {
  const [hoverValue, setHoverValue] = useState(null)
  const activeValue = hoverValue ?? Number(value) ?? 0

  const getStarFill = (starIndex) => {
    const starValue = starIndex + 1
    if (activeValue >= starValue) return 'full'
    if (activeValue >= starValue - 0.5) return 'half'
    return 'empty'
  }

  const handleMouseMove = (e, starIndex) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const isLeftHalf = e.clientX - rect.left < rect.width / 2
    const nextValue = isLeftHalf ? starIndex + 0.5 : starIndex + 1
    setHoverValue(nextValue)
  }

  const handleClick = (e, starIndex) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const isLeftHalf = e.clientX - rect.left < rect.width / 2
    const nextValue = isLeftHalf ? starIndex + 0.5 : starIndex + 1
    onChange(Number(value) === nextValue ? 0 : nextValue)
  }

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}
      onMouseLeave={() => setHoverValue(null)}
    >
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0, 1, 2, 3, 4].map((starIndex) => {
          const fill = getStarFill(starIndex)

          return (
            <button
              key={starIndex}
              type="button"
              onMouseMove={(e) => handleMouseMove(e, starIndex)}
              onClick={(e) => handleClick(e, starIndex)}
              style={{
                position: 'relative',
                width: '30px',
                height: '30px',
                border: 'none',
                background: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: '30px',
                lineHeight: 1,
              }}
            >
              <span style={{ color: '#d8d2c8', position: 'absolute', inset: 0 }}>★</span>

              {fill === 'full' && (
                <span style={{ color: '#d4a017', position: 'absolute', inset: 0 }}>★</span>
              )}

              {fill === 'half' && (
                <span
                  style={{
                    color: '#d4a017',
                    position: 'absolute',
                    inset: 0,
                    width: '50%',
                    overflow: 'hidden',
                  }}
                >
                  ★
                </span>
              )}
            </button>
          )
        })}
      </div>

      <span
        style={{
          fontSize: '13px',
          fontWeight: '700',
          color: 'var(--color-text-muted)',
          minWidth: '42px',
        }}
      >
        {activeValue ? activeValue.toFixed(1) : '0.0'}
      </span>
    </div>
  )
}

export default function BookModal({
  book,
  session,
  onClose,
  onRatingChange,
  onStatusChange,
  onRemove,
  onProgressChange,
  onShelvesChange,
}) {
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [pageInput, setPageInput] = useState('')
  const [noteText, setNoteText] = useState('')
  const [notePage, setNotePage] = useState('')
  const [shelvesInput, setShelvesInput] = useState('')

  const { notes, loading: notesLoading, addNote, removeNote } = useBookNotes(book?.id, session)

  useEffect(() => {
    setShowFullDesc(false)
    setPageInput(book ? String(book.current_page || 0) : '')
    setNoteText('')
    setNotePage('')
    setShelvesInput(Array.isArray(book?.shelves) ? book.shelves.join(', ') : '')
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

  const handleAddNote = async () => {
    await addNote({
      content: noteText,
      page: notePage,
    })

    setNoteText('')
    setNotePage('')
  }

  const handleSaveShelves = () => {
    const nextShelves = shelvesInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    onShelvesChange?.(book.id, nextShelves)
  }

  const totalPages = Number(book.pages) || 0
  const currentPage = Number(book.current_page) || 0
  const progressPercent = totalPages > 0
    ? Math.min(100, Math.round((currentPage / totalPages) * 100))
    : 0

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
              <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                Valutazione
              </p>

              <StarRating
                value={Number(book.rating) || 0}
                onChange={(newValue) => onRatingChange(book.id, newValue)}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '24px' }} />

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
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

            {book.pages ? (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '24px' }} />

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                    Progresso lettura
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                      {currentPage} / {book.pages} pagine
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: '700' }}>
                      {progressPercent}%
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '10px',
                      borderRadius: '999px',
                      background: 'var(--color-surface-high)',
                      overflow: 'hidden',
                      marginBottom: '14px',
                    }}
                  >
                    <div
                      style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        borderRadius: '999px',
                        background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))',
                        transition: 'width 280ms ease-out',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="number"
                      min="0"
                      max={book.pages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      placeholder="Pagina corrente"
                      className="input-field input-field-boxed"
                      style={{ flex: '1 1 180px' }}
                    />
                    <button
                      className="btn-primary"
                      onClick={() => onProgressChange(book.id, pageInput)}
                    >
                      Salva progresso
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '24px' }} />

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                Scaffali
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <input
                  className="input-field input-field-boxed"
                  value={shelvesInput}
                  onChange={(e) => setShelvesInput(e.target.value)}
                  placeholder="es. fantasy, preferiti, da comprare"
                  style={{ flex: '1 1 220px' }}
                />
                <button className="btn-primary" onClick={handleSaveShelves}>
                  Salva scaffali
                </button>
              </div>

              {Array.isArray(book.shelves) && book.shelves.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {book.shelves.map((shelf, i) => (
                    <span
                      key={`${shelf}-${i}`}
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
                      {shelf}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '24px' }} />

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                Note
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                <textarea
                  className="input-field input-field-boxed"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Scrivi un pensiero, una riflessione o una citazione..."
                  rows={4}
                  style={{ resize: 'vertical', minHeight: '96px' }}
                />

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    min="1"
                    value={notePage}
                    onChange={(e) => setNotePage(e.target.value)}
                    placeholder="Pagina (opzionale)"
                    className="input-field input-field-boxed"
                    style={{ width: '180px' }}
                  />
                  <button className="btn-primary" onClick={handleAddNote}>
                    Aggiungi nota
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notesLoading ? (
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                    Caricamento note...
                  </p>
                ) : notes.length === 0 ? (
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                    Nessuna nota ancora per questo libro.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      style={{
                        border: '1px solid var(--color-outline-variant)',
                        borderRadius: '14px',
                        padding: '14px',
                        background: 'var(--color-surface-2)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          {note.page && (
                            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>
                              Pagina {note.page}
                            </p>
                          )}

                          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>
                            {note.content}
                          </p>
                        </div>

                        <button
                          onClick={() => removeNote(note.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#b85c5c',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '700',
                          }}
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {(book.year || book.pages || book.started_at || book.finished_at || (Array.isArray(book.genres) && book.genres.length > 0)) && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', marginBottom: '24px' }} />

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
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

                    {book.started_at && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Iniziato</span>
                        <span style={{ color: 'var(--color-text)', fontSize: '14px', fontWeight: '600' }}>
                          {book.started_at}
                        </span>
                      </div>
                    )}

                    {book.finished_at && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Finito</span>
                        <span style={{ color: 'var(--color-text)', fontSize: '14px', fontWeight: '600' }}>
                          {book.finished_at}
                        </span>
                      </div>
                    )}

                    {Array.isArray(book.genres) && book.genres.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Generi</span>
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
                  <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                    Descrizione
                  </p>

                  <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--color-text)' }}>
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
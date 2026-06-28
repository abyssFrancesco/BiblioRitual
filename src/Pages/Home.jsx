import { useRef, useState } from 'react'
import BookCardV from '../components/BookCardV'
import BookCard from '../components/BookCard'
import QuoteHero from '../components/QuoteHero'
import BookModal from '../components/BookModal'

function BooksRow({ title, items, onBookClick }) {
  const rowRef = useRef(null)

  const scrollRow = (direction) => {
    if (!rowRef.current) return
    const amount = 540
    rowRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  if (items.length === 0) return null

  const showArrows = items.length > 7

  return (
    <section style={{ marginBottom: '36px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>{title}</h2>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
            {items.length} {items.length === 1 ? 'libro' : 'libri'}
          </span>
        </div>

        {showArrows && (
          <div className="row-arrows">
            <button
              className="row-arrow-btn"
              onClick={() => scrollRow('left')}
              aria-label={`Scorri ${title} a sinistra`}
            >
              ←
            </button>
            <button
              className="row-arrow-btn"
              onClick={() => scrollRow('right')}
              aria-label={`Scorri ${title} a destra`}
            >
              →
            </button>
          </div>
        )}
      </div>

      <div ref={rowRef} className="scroll-row books-row-no-scrollbar">
        {items.map(book => (
          <BookCardV
            key={book.id}
            book={book}
            onClick={() => onBookClick(book)}
          />
        ))}
      </div>
    </section>
  )
}

export default function Home({
  books, addBook, updateRating, updateStatus, removeBook,
  showSearch, setShowSearch, onAddBook,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)

  const reading = books.filter(b => b.status === 'reading')
  const toread = books.filter(b => b.status === 'toread')
  const read = books.filter(b => b.status === 'read')

  const isAdded = (id) => books.some(b => b.id === id)

  const searchBooks = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResults([])

    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,cover_i,first_sentence`
      )
      const data = await res.json()

      const fetched = await Promise.all(
        data.docs.map(async (doc) => {
          let description = ''

          const extractDesc = (d) => {
            if (!d?.description) return ''
            return typeof d.description === 'string'
              ? d.description
              : d.description?.value || ''
          }

          if (doc.key) {
            try {
              const enRes = await fetch(`https://openlibrary.org${doc.key}.json`)
              const enData = await enRes.json()
              description = extractDesc(enData)
              if (!description) description = doc.first_sentence?.[0] || ''
            } catch {
              description = doc.first_sentence?.[0] || ''
            }
          }

          if (description.length > 500) {
            const cut = description.slice(0, 500)
            const lastDot = Math.max(
              cut.lastIndexOf('.'),
              cut.lastIndexOf('!'),
              cut.lastIndexOf('?')
            )
            description = lastDot > 200 ? cut.slice(0, lastDot + 1) : cut + '...'
          }

          return {
            id: doc.key,
            title: doc.title,
            author: doc.author_name?.[0] || 'Autore sconosciuto',
            coverId: doc.cover_i || null,
            description,
          }
        })
      )

      setResults(fetched)
    } catch {
      setResults([])
    }

    setLoading(false)
  }

  const closeSearch = () => {
    setShowSearch(false)
    setResults([])
    setQuery('')
  }

  return (
    <div>
      <QuoteHero />

      {books.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📚</p>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '20px',
            color: 'var(--color-text)',
            marginBottom: '8px'
          }}>
            La tua libreria è vuota
          </p>
          <p style={{ fontSize: '14px', marginBottom: '24px' }}>
            Aggiungi il tuo primo libro dal menu laterale
          </p>
          <button className="btn-primary" onClick={onAddBook}>+ Aggiungi libro</button>
        </div>
      )}

      <BooksRow title="In lettura" items={reading} onBookClick={setSelectedBook} />
      <BooksRow title="Da leggere" items={toread} onBookClick={setSelectedBook} />
      <BooksRow title="Letti" items={read} onBookClick={setSelectedBook} />

      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onRatingChange={(id, r) => {
          updateRating(id, r)
          setSelectedBook(prev => ({ ...prev, rating: r }))
        }}
        onStatusChange={(id, s) => {
          updateStatus(id, s)
          setSelectedBook(prev => ({ ...prev, status: s }))
        }}
        onRemove={removeBook}
      />

      {showSearch && (
        <div className="modal-overlay" onClick={closeSearch} style={{ alignItems: 'center', padding: '20px' }}>
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '85dvh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: 0,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
                  Aggiungi un libro
                </h3>
                <button
                  onClick={closeSearch}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1,
                    padding: '4px',
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--color-outline-variant)'
              }}>
                <input
                  className="input-field"
                  placeholder="Cerca titolo o autore..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchBooks()}
                  autoFocus
                />
                <button className="btn-primary" onClick={searchBooks}>Cerca</button>
              </div>
            </div>

            <div style={{ overflowY: 'auto', padding: '12px 24px 24px', scrollbarWidth: 'none' }}>
              {loading && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '40px 20px',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    border: '3px solid var(--color-outline-variant)',
                    borderTop: '3px solid var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Recupero libri in corso...
                  </p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {!loading && results.map(book => (
                <div key={book.id} style={{ position: 'relative', marginBottom: '8px' }}>
                  <BookCard book={{ ...book, cover_id: book.coverId, rating: 0, status: 'toread' }} />
                  {!isAdded(book.id)
                    ? (
                      <button
                        className="btn-primary"
                        onClick={() => addBook(book)}
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          fontSize: '12px',
                          padding: '4px 12px'
                        }}
                      >
                        + Aggiungi
                      </button>
                    ) : (
                      <span style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)'
                      }}>
                        ✓ Aggiunto
                      </span>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
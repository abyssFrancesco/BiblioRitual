import { useEffect, useMemo, useRef, useState } from 'react'
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
    <section style={{ marginBottom: 36 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            {title}
          </h2>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
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
        {items.map((book) => (
          <BookCardV key={book.id} book={book} onClick={() => onBookClick(book)} />
        ))}
      </div>
    </section>
  )
}

function BooksRowSkeleton({ title, count = 5 }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            width: 160,
            height: 24,
            borderRadius: 999,
            background:
              'linear-gradient(90deg, var(--color-surface-high) 25%, #f3efe8 50%, var(--color-surface-high) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonShimmer 1.4s ease-in-out infinite',
          }}
        />
      </div>

      <div className="scroll-row books-row-no-scrollbar" style={{ overflow: 'hidden' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={`${title}-${i}`} style={{ width: 172, flexShrink: 0 }}>
            <div
              style={{
                width: 172,
                height: 248,
                borderRadius: 14,
                marginBottom: 14,
                background:
                  'linear-gradient(90deg, var(--color-surface-high) 25%, #f3efe8 50%, var(--color-surface-high) 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeletonShimmer 1.4s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: 82,
                height: 18,
                borderRadius: 999,
                marginBottom: 8,
                background:
                  'linear-gradient(90deg, var(--color-surface-high) 25%, #f3efe8 50%, var(--color-surface-high) 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeletonShimmer 1.4s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: 58,
                height: 12,
                borderRadius: 999,
                background:
                  'linear-gradient(90deg, var(--color-surface-high) 25%, #f3efe8 50%, var(--color-surface-high) 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeletonShimmer 1.4s ease-in-out infinite',
              }}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

const STATUS_LABELS = {
  toread: 'Da leggere',
  reading: 'In lettura',
  read: 'Letto',
  dnf: 'Interrotto',
}

export default function Home({
  session,
  books,
  loading,
  refreshing,
  addBook,
  updateRating,
  updateStatus,
  updateProgress,
  removeBook,
  preferences,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [libraryQuery, setLibraryQuery] = useState('')

  const lastScrollYRef = useRef(0)

  useEffect(() => {
    const openModal = () => {
      setSelectedBook(null)
      setShowSearch(true)
    }

    window.addEventListener('open-add-book-modal', openModal)
    return () => window.removeEventListener('open-add-book-modal', openModal)
  }, [])

  const getExistingBook = (id) => books.find((b) => b.id === id)

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const q = libraryQuery.trim().toLowerCase()
      if (!q) return true

      const inTitle = book.title?.toLowerCase().includes(q)
      const inAuthor = book.author?.toLowerCase().includes(q)
      const inGenres = Array.isArray(book.genres)
        ? book.genres.some((genre) => genre?.toLowerCase().includes(q))
        : false

      return inTitle || inAuthor || inGenres
    })
  }, [books, libraryQuery])

  const reading = filteredBooks.filter((b) => b.status === 'reading')
  const toread = filteredBooks.filter((b) => b.status === 'toread')
  const read = filteredBooks.filter((b) => b.status === 'read')
  const dnf = filteredBooks.filter((b) => b.status === 'dnf')

  const openBookModal = (book) => {
    lastScrollYRef.current = window.scrollY || window.pageYOffset || 0
    setSelectedBook(book)
  }

  const closeBookModal = () => {
    setSelectedBook(null)

    requestAnimationFrame(() => {
      window.scrollTo(0, lastScrollYRef.current)
    })
  }

  const searchBooks = async () => {
    if (!query.trim()) return

    setSearchLoading(true)
    setResults([])

    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          query
        )}&limit=10&fields=key,title,author_name,cover_i,first_sentence,first_publish_year,number_of_pages_median,subject`
      )
      const data = await res.json()

      const fetched = await Promise.all(
        data.docs.map(async (doc) => {
          let description = ''
          let genres = Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : []

          const extractDesc = (d) => {
            if (!d?.description) return ''
            return typeof d.description === 'string' ? d.description : d.description?.value || ''
          }

          if (doc.key) {
            try {
              const workRes = await fetch(`https://openlibrary.org${doc.key}.json`)
              const workData = await workRes.json()
              description = extractDesc(workData) || doc.first_sentence?.[0] || ''
              if ((!genres || genres.length === 0) && Array.isArray(workData.subjects)) {
                genres = workData.subjects.slice(0, 3)
              }
            } catch {
              description = doc.first_sentence?.[0] || ''
            }
          }

          if (description.length > 500) {
            const cut = description.slice(0, 500)
            const lastDot = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'))
            description = lastDot > 200 ? cut.slice(0, lastDot + 1) : `${cut}...`
          }

          return {
            id: doc.key,
            title: doc.title,
            author: doc.author_name?.[0] || 'Autore sconosciuto',
            coverId: doc.cover_i || null,
            description,
            year: doc.first_publish_year || null,
            pages: doc.number_of_pages_median || null,
            genres: Array.isArray(genres) ? genres : [],
          }
        })
      )

      setResults(fetched)
    } catch {
      setResults([])
    }

    setSearchLoading(false)
  }

  const closeSearch = () => {
    setShowSearch(false)
    setResults([])
    setQuery('')
  }

  const renderSection = (sectionTitle, items) => {
    if (!items.length) return null

    return (
      <BooksRow
        key={sectionTitle}
        title={sectionTitle}
        items={items}
        onBookClick={openBookModal}
      />
    )
  }

  return (
    <div>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <QuoteHero />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn-primary" onClick={() => setShowSearch(true)}>
          Aggiungi libro
        </button>
      </div>

      <div className="library-filters">
        <input
          className="input-field input-field-boxed"
          placeholder="Cerca nella tua libreria..."
          value={libraryQuery}
          onChange={(e) => setLibraryQuery(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: 0 }}
        />
      </div>

      {refreshing && !loading && (
        <div
          style={{
            marginBottom: 14,
            fontSize: 12,
            color: 'var(--color-text-muted)',
            opacity: 0.9,
          }}
        >
          Aggiornamento libreria...
        </div>
      )}

      {loading && (
        <>
          <BooksRowSkeleton title="In lettura" />
          <BooksRowSkeleton title="Da leggere" />
          <BooksRowSkeleton title="Letti" />
          <BooksRowSkeleton title="Interrotti" />
        </>
      )}

      {!loading && filteredBooks.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-text-muted)',
          }}
        >
          <p style={{ fontSize: 48, marginBottom: 16 }}>📚</p>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 20,
              color: 'var(--color-text)',
              marginBottom: 8,
            }}
          >
            {books.length === 0 ? 'La tua libreria è vuota' : 'Nessun libro trovato'}
          </p>
          <p style={{ fontSize: 14, marginBottom: 24 }}>
            {books.length === 0 ? 'Aggiungi il tuo primo libro' : 'Prova a cambiare ricerca'}
          </p>

          {books.length === 0 && (
            <button className="btn-primary" onClick={() => setShowSearch(true)}>
              Aggiungi libro
            </button>
          )}
        </div>
      )}

      {!loading && renderSection('In lettura', reading)}
      {!loading && renderSection('Da leggere', toread)}
      {!loading && renderSection('Letti', read)}
      {!loading && renderSection('Interrotti', dnf)}

<BookModal
  book={selectedBook}
  session={session}
  preferences={preferences}
  onClose={closeBookModal}
  onRatingChange={(id, r) => {
    updateRating(id, r)
    setSelectedBook((prev) => (prev ? { ...prev, rating: r } : prev))
  }}
onStatusChange={(id, s) => {
  updateStatus(id, s)

  setSelectedBook((prev) => {
    if (!prev) return prev

    const totalPages = Number(prev.pages || 0)
    const today = new Date().toISOString().slice(0, 10)
    const patch = { status: s }

    if (s === 'reading') {
      if (!prev.started_at) patch.started_at = today
      patch.finished_at = null
    }

    if (s === 'read') {
      if (totalPages > 0) {
        patch.current_page = totalPages
        patch.currentpage = totalPages
      }
      if (!prev.started_at) patch.started_at = today
      patch.finished_at = today
    }

    if (s === 'toread' || s === 'dnf') {
      patch.finished_at = null
    }

    return { ...prev, ...patch }
  })
}}
  onRemove={removeBook}
  onProgressChange={(id, page) => {
    updateProgress(id, page)

    const currentBook = books.find((b) => b.id === id)
    const totalPages = Number(currentBook?.pages || 0)
    let safePage = Number(page || 0)

    if (safePage < 0) safePage = 0
    if (totalPages > 0 && safePage > totalPages) safePage = totalPages

    const nextStatus =
      totalPages > 0 && safePage >= totalPages
        ? 'read'
        : safePage > 0 &&
          (selectedBook?.status === 'toread' || selectedBook?.status === 'dnf')
        ? 'reading'
        : selectedBook?.status

    setSelectedBook((prev) =>
      prev
        ? {
            ...prev,
            current_page: safePage,
            currentpage: safePage,
            status: nextStatus,
          }
        : prev
    )
  }}
/>

      {showSearch && (
        <div
          className="modal-overlay"
          onClick={closeSearch}
          style={{ alignItems: 'center', padding: 20 }}
        >
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
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>
                  Aggiungi un libro
                </h3>

                <button
                  onClick={closeSearch}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 20,
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1,
                    padding: 4,
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--color-outline-variant)',
                }}
              >
                <input
                  className="input-field"
                  placeholder="Cerca titolo o autore..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
                  autoFocus
                />
                <button className="btn-primary" onClick={searchBooks}>
                  Cerca
                </button>
              </div>
            </div>

            <div
              style={{
                overflowY: 'auto',
                padding: '12px 24px 24px',
                scrollbarWidth: 'none',
              }}
            >
              {searchLoading ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '40px 20px',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      border: '3px solid var(--color-outline-variant)',
                      borderTop: '3px solid var(--color-primary)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Recupero libri in corso...
                  </p>
                </div>
              ) : (
                results.map((book) => {
                  const existingBook = getExistingBook(book.id)
                  const displayBook = existingBook
                    ? {
                        ...book,
                        ...existingBook,
                        cover_id: existingBook.cover_id || book.coverId,
                      }
                    : {
                        ...book,
                        cover_id: book.coverId,
                        rating: 0,
                        status: 'toread',
                      }

                  return (
                    <div
                      key={book.id}
                      style={{
                        marginBottom: 10,
                        padding: 10,
                        borderRadius: 18,
                        background: existingBook ? 'var(--color-primary-light)' : 'transparent',
                        transition: 'background-color 220ms ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 12,
                          marginBottom: existingBook ? 8 : 0,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <BookCard book={displayBook} />
                        </div>

                        {!existingBook ? (
                          <button
                            className="btn-primary"
                            onClick={() => addBook(book)}
                            style={{
                              flexShrink: 0,
                              alignSelf: 'center',
                              fontSize: 12,
                              padding: '8px 12px',
                            }}
                          >
                            Aggiungi
                          </button>
                        ) : null}
                      </div>

                      {existingBook && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            paddingLeft: 90,
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              color: 'var(--color-primary)',
                              background: 'white',
                              border: '1px solid rgba(45, 90, 61, 0.12)',
                              borderRadius: 9999,
                              padding: '6px 10px',
                            }}
                          >
                            Già in libreria
                          </span>

                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            Stato: {STATUS_LABELS[existingBook.status] || 'Da leggere'}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
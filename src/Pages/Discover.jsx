import { useMemo } from 'react'

export default function Discover({ books, preferences }) {
  const lang = preferences?.discover_language || 'it'
  const isItalian = lang === 'it'

  const readBooks = useMemo(
    () => books.filter((book) => book.status === 'read'),
    [books]
  )

  const topRatedBooks = useMemo(() => {
    return [...books]
      .filter((book) => Number(book.rating || 0) >= 4)
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 6)
  }, [books])

  const topAuthors = useMemo(() => {
    const counts = new Map()

    books.forEach((book) => {
      const author = book.author?.trim()
      if (!author) return
      counts.set(author, (counts.get(author) || 0) + 1)
    })

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [books])

  const topGenres = useMemo(() => {
    const counts = new Map()

    books.forEach((book) => {
      const genres = Array.isArray(book.genres) ? book.genres : []
      genres.forEach((genre) => {
        const clean = genre?.trim()
        if (!clean) return
        counts.set(clean, (counts.get(clean) || 0) + 1)
      })
    })

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [books])

  const underExploredGenres = useMemo(() => {
    const counts = new Map()

    books.forEach((book) => {
      const genres = Array.isArray(book.genres) ? book.genres : []
      genres.forEach((genre) => {
        const clean = genre?.trim()
        if (!clean) return
        counts.set(clean, (counts.get(clean) || 0) + 1)
      })
    })

    return Array.from(counts.entries())
      .filter(([, count]) => count <= 2)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 6)
  }, [books])

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section className="card" style={{ padding: 28, borderRadius: 28 }}>
        <p
          style={{
            margin: 0,
            marginBottom: 10,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--color-text-muted)',
          }}
        >
          Discover
        </p>

        <h1
          style={{
            margin: 0,
            marginBottom: 8,
            fontFamily: 'var(--font-serif)',
            fontSize: 34,
            lineHeight: 1.1,
          }}
        >
          {isItalian ? 'Esplora la tua prossima lettura' : 'Explore your next read'}
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.7,
            color: 'var(--color-text-muted)',
            maxWidth: 760,
          }}
        >
          {isItalian
            ? 'Questa sezione usa i segnali della tua libreria per mostrarti autori forti, generi dominanti e spazi ancora poco esplorati.'
            : 'This section uses signals from your library to surface strong authors, dominant genres, and areas you have barely explored.'}
        </p>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          gap: 18,
        }}
      >
        <div className="card" style={{ padding: 24, borderRadius: 24 }}>
          <p
            style={{
              margin: 0,
              marginBottom: 12,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
            }}
          >
            {isItalian ? 'I tuoi segnali forti' : 'Your strongest signals'}
          </p>

          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                {isItalian ? 'Autori più presenti' : 'Most represented authors'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topAuthors.length === 0 ? (
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                    {isItalian ? 'Ancora nessun segnale forte.' : 'No strong signals yet.'}
                  </span>
                ) : (
                  topAuthors.map(([author, count]) => (
                    <span
                      key={author}
                      style={{
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        borderRadius: 9999,
                        padding: '8px 12px',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {author} · {count}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                {isItalian ? 'Generi più presenti' : 'Most represented genres'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topGenres.length === 0 ? (
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                    {isItalian ? 'Nessun genere disponibile.' : 'No genres available.'}
                  </span>
                ) : (
                  topGenres.map(([genre, count]) => (
                    <span
                      key={genre}
                      style={{
                        background: 'var(--color-surface-high)',
                        color: 'var(--color-text)',
                        borderRadius: 9999,
                        padding: '8px 12px',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {genre} · {count}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24, borderRadius: 24 }}>
          <p
            style={{
              margin: 0,
              marginBottom: 12,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
            }}
          >
            {isItalian ? 'Da approfondire' : 'Worth exploring'}
          </p>

          {underExploredGenres.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              {isItalian
                ? 'Quando la tua libreria sarà più varia, qui vedrai nicchie e zone ancora poco esplorate.'
                : 'As your library becomes more varied, this area will surface niches and lightly explored spaces.'}
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {underExploredGenres.map(([genre, count]) => (
                <div
                  key={genre}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    paddingBottom: 10,
                    borderBottom: '1px solid var(--color-outline-variant)',
                  }}
                >
                  <span style={{ fontSize: 14, color: 'var(--color-text)' }}>{genre}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {count} {isItalian ? 'presenze' : 'entries'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card" style={{ padding: 24, borderRadius: 24 }}>
        <p
          style={{
            margin: 0,
            marginBottom: 12,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--color-text-muted)',
          }}
        >
          {isItalian ? 'Titoli già molto apprezzati' : 'Books you already value highly'}
        </p>

        {topRatedBooks.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)' }}>
            {isItalian
              ? 'Quando assegnerai rating ai libri, qui emergeranno i tuoi riferimenti principali.'
              : 'Once you rate your books, your strongest reference points will appear here.'}
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}
          >
            {topRatedBooks.map((book) => (
              <div
                key={book.id}
                style={{
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 18,
                  padding: 16,
                  background: 'var(--color-surface)',
                }}
              >
                <p
                  style={{
                    margin: '0 0 6px',
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    lineHeight: 1.4,
                  }}
                >
                  {book.title}
                </p>

                <p
                  style={{
                    margin: '0 0 10px',
                    fontSize: 13,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {book.author}
                </p>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 9999,
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    padding: '7px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ★ {Number(book.rating || 0).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card" style={{ padding: 24, borderRadius: 24 }}>
        <p
          style={{
            margin: 0,
            marginBottom: 12,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: 'var(--color-text-muted)',
          }}
        >
          {isItalian ? 'Lettura attuale' : 'Current reading shape'}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
          }}
        >
          <div
            style={{
              borderRadius: 18,
              padding: 18,
              background: 'var(--color-surface-high)',
            }}
          >
            <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 700 }}>
              {isItalian ? 'Libri letti' : 'Read books'}
            </p>
            <p style={{ margin: 0, fontSize: 28, fontFamily: 'var(--font-serif)' }}>
              {readBooks.length}
            </p>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: 18,
              background: 'var(--color-surface-high)',
            }}
          >
            <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 700 }}>
              {isItalian ? 'Libri totali' : 'Total books'}
            </p>
            <p style={{ margin: 0, fontSize: 28, fontFamily: 'var(--font-serif)' }}>
              {books.length}
            </p>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: 18,
              background: 'var(--color-surface-high)',
            }}
          >
            <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 700 }}>
              {isItalian ? 'Titoli con rating alto' : 'Highly rated titles'}
            </p>
            <p style={{ margin: 0, fontSize: 28, fontFamily: 'var(--font-serif)' }}>
              {topRatedBooks.length}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
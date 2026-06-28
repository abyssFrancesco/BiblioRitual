export default function BookCardV({ book, onClick }) {
  const cover = book.cover_id
    ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
    : null

  const ratingPct = (book.rating / 5) * 100

  return (
    <div
      onClick={onClick}
      style={{ width: '160px', flexShrink: 0, cursor: 'pointer' }}
    >
      {/* Copertina */}
      <div style={{
        width: '160px', height: '230px',
        borderRadius: '10px', overflow: 'hidden',
        background: 'var(--color-surface-high)',
        boxShadow: '4px 6px 20px rgba(0,0,0,0.18)',
        marginBottom: '12px',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '4px 12px 28px rgba(0,0,0,0.25)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '4px 6px 20px rgba(0,0,0,0.18)'
        }}
      >
        {cover
          ? <img
              src={cover}
              alt={book.title}
              loading="lazy"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
              }}
            />
          : <div style={{ width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '44px' }}>📖</div>
        }
      </div>

      {/* Titolo */}
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '17px', fontWeight: '700',
        lineHeight: 1.35, marginBottom: '4px',
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
        color: 'var(--color-text)',
      }}>{book.title}</p>

      {/* Autore */}
      <p style={{
        fontSize: '12px', color: 'var(--color-text-muted)',
        marginBottom: '8px', whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{book.author}</p>

      {/* Rating bar */}
      {book.rating > 0 && (
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${ratingPct}%` }} />
        </div>
      )}
    </div>
  )
}
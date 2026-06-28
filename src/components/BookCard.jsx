import StarRating from './StarRating'

const STATUS_OPTIONS = [
  { value: 'toread',  label: 'Da leggere' },
  { value: 'reading', label: 'In lettura' },
  { value: 'read',    label: 'Letto' },
]

export default function BookCard({ book, onRatingChange, onStatusChange, onRemove }) {
const cover = book.cover_id
  ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
  : null

  return (
    <div className="card" style={{ display: 'flex', gap: '14px', marginBottom: '12px', position: 'relative' }}>

      {/* Cover */}
      <div style={{
        width: '76px', minWidth: '76px', height: '110px',
        borderRadius: '4px', overflow: 'hidden',
        boxShadow: '3px 4px 14px rgba(0,0,0,0.22)',
        background: 'var(--color-surface-high)', flexShrink: 0,
      }}>
        {cover
          ? <img src={cover} alt={book.title} width={76} height={110}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-outline)', fontSize: '30px' }}>📖</div>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ marginBottom: '3px', paddingRight: onRemove ? '24px' : '0' }}>
          {book.title}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
          {book.author}
        </p>

        {book.description && (
          <p style={{
            fontSize: '12px', color: 'var(--color-outline)', marginBottom: '10px',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{book.description}</p>
        )}

        {/* Rating */}
        <div style={{ marginBottom: '8px' }}>
          <StarRating rating={book.rating} onChange={onRatingChange} size={18} />
        </div>

        {/* Status pills */}
        {onStatusChange && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => onStatusChange(opt.value)} style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px', fontWeight: '700',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                border: book.status === opt.value
                  ? '1.5px solid var(--color-primary)'
                  : '1.5px solid var(--color-outline-variant)',
                background: book.status === opt.value ? 'var(--color-primary)' : 'transparent',
                color: book.status === opt.value ? 'white' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}>{opt.label}</button>
            ))}
          </div>
        )}

        {!onStatusChange && (
          <span className="chip">{STATUS_OPTIONS.find(o => o.value === book.status)?.label}</span>
        )}
      </div>

      {/* Remove button */}
      {onRemove && (
        <button onClick={onRemove} style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-outline)', fontSize: '16px',
          lineHeight: 1, padding: '2px',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => e.target.style.color = '#c0392b'}
        onMouseLeave={e => e.target.style.color = 'var(--color-outline)'}
        title="Rimuovi libro"
        >✕</button>
      )}
    </div>
  )
}
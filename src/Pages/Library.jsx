import { useState } from 'react'
import BookCard from '../components/BookCard'

const FILTERS = [
  { key: 'all',     label: 'Tutti' },
  { key: 'reading', label: 'In lettura' },
  { key: 'read',    label: 'Letti' },
  { key: 'toread',  label: 'Da leggere' },
]

export default function Library({ books, updateRating, updateStatus, removeBook }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? books : books.filter(b => b.status === filter)

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <h2 style={{ marginBottom: '20px' }}>La mia libreria</h2>

      {/* Filtri */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px', fontWeight: '700',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            border: 'none', cursor: 'pointer',
            background: filter === f.key ? 'var(--color-primary)' : 'var(--color-surface)',
            color: filter === f.key ? 'white' : 'var(--color-text-muted)',
            boxShadow: filter === f.key ? 'none' : 'var(--shadow-card)',
            transition: 'all 180ms ease',
          }}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-outline)' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>📚</p>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '8px', color: 'var(--color-text)' }}>
            Nessun libro qui
          </p>
          <p style={{ fontSize: '14px' }}>Aggiungi un libro dalla Home</p>
        </div>
      )}

      {filtered.map(book => (
        <BookCard
          key={book.id}
          book={book}
          onRatingChange={rating => updateRating(book.id, rating)}
          onStatusChange={status => updateStatus(book.id, status)}
          onRemove={() => removeBook(book.id)}
        />
      ))}
    </div>
  )
}
import { useState } from 'react'

export default function StarRating({ rating = 0, onChange, size = 20 }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{
            fontSize: `${size}px`,
            cursor: onChange ? 'pointer' : 'default',
            color: star <= (hovered || rating) ? 'var(--color-primary)' : 'var(--color-outline-variant)',
            transition: 'color 120ms ease',
            userSelect: 'none',
          }}
        >★</span>
      ))}
    </div>
  )
}
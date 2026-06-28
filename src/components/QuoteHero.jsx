import { useState, useEffect, useCallback } from 'react'

const QUOTES = [
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "It is our choices that show what we truly are, far more than our abilities.", author: "J.K. Rowling" },
  { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
  { text: "A book is a dream that you hold in your hands.", author: "Neil Gaiman" },
  { text: "We read to know we are not alone.", author: "C.S. Lewis" },
  { text: "Until I feared I would lose it, I never loved to read.", author: "Harper Lee" },
  { text: "Words are our most inexhaustible source of magic.", author: "J.K. Rowling" },
  { text: "The world was hers for the reading.", author: "Betty Smith" },
  { text: "One must always be careful of books, and what is inside them.", author: "Cassandra Clare" },
  { text: "So it goes.", author: "Kurt Vonnegut" },
  { text: "All that is gold does not glitter.", author: "J.R.R. Tolkien" },
]

function getRandomQuotes(all, count = 5) {
  return [...all].sort(() => Math.random() - 0.5).slice(0, count)
}

export default function QuoteHero() {
  const [quotes] = useState(() => getRandomQuotes(QUOTES, 5))
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)

  const goTo = useCallback((i) => {
    setFading(true)
    setTimeout(() => {
      setIndex(i)
      setFading(false)
    }, 220)
  }, [])

  useEffect(() => {
    const t = setInterval(() => goTo((index + 1) % quotes.length), 6000)
    return () => clearInterval(t)
  }, [index, quotes.length, goTo])

  const q = quotes[index]

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1f4b33 0%, #2d5a3d 60%, #3a7a52 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '34px 38px',
        marginBottom: '36px',
        height: '260px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 16px 36px rgba(31,75,51,0.20)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-30px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-80px',
          right: '120px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          opacity: fading ? 0 : 1,
          transform: fading ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 220ms var(--ease-premium), transform 220ms var(--ease-premium)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <p
          style={{
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.52)',
            marginBottom: '18px',
          }}
        >
          Daily Incantation
        </p>

        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(22px, 2.8vw, 34px)',
            fontWeight: '400',
            color: '#ffffff',
            lineHeight: 1.42,
            marginBottom: '14px',
            maxWidth: '680px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          "{q.text}"
        </p>

        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '15px',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          — {q.author}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '20px', position: 'relative', zIndex: 2 }}>
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === index ? '26px' : '8px',
              height: '8px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              background: i === index ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.30)',
              transition: 'all var(--transition-mid)',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
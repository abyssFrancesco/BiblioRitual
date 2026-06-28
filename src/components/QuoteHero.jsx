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
    setTimeout(() => { setIndex(i); setFading(false) }, 280)
  }, [])

  useEffect(() => {
    const t = setInterval(() => goTo((index + 1) % quotes.length), 6000)
    return () => clearInterval(t)
  }, [index, quotes.length, goTo])

  const q = quotes[index]

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3d2a 0%, #2d5a3d 60%, #3a7a52 100%)',
      borderRadius: 'var(--radius-xl)',
      padding: '40px 48px',
      marginBottom: '40px',
      minHeight: '220px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorazione sfondo */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '200px', height: '200px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', right: '80px',
        width: '280px', height: '280px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
        pointerEvents: 'none',
      }} />

      {/* Contenuto */}
      <div style={{
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 280ms ease, transform 280ms ease',
      }}>
        <p style={{
          fontSize: '11px', fontWeight: '700',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '20px',
        }}>Daily Incantation</p>

        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(22px, 3vw, 32px)',
          fontWeight: '400',
          color: '#ffffff',
          lineHeight: 1.5,
          marginBottom: '16px',
          maxWidth: '600px',
        }}>"{q.text}"</p>

        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '15px',
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.6)',
        }}>— {q.author}</p>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '28px' }}>
        {quotes.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === index ? '24px' : '8px',
            height: '8px',
            borderRadius: 'var(--radius-full)',
            border: 'none', cursor: 'pointer',
            background: i === index ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
            transition: 'all 300ms ease',
            padding: 0,
          }} />
        ))}
      </div>
    </div>
  )
}
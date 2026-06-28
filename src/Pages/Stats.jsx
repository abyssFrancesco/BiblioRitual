import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'

function StatCard({ label, value, hint, accent = false }) {
  return (
    <div
      className="card"
      style={{
        padding: '20px',
        background: accent ? 'var(--color-primary-light)' : 'var(--color-surface)',
      }}
    >
      <p
        style={{
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: accent ? 'var(--color-primary)' : 'var(--color-text-muted)',
          marginBottom: '10px',
        }}
      >
        {label}
      </p>

      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '32px',
          lineHeight: 1,
          fontWeight: '800',
          color: 'var(--color-text)',
          marginBottom: '10px',
        }}
      >
        {value}
      </p>

      {hint && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

export default function Stats({ books = [], session }) {
  const [goalInput, setGoalInput] = useState('')
  const [yearGoal, setYearGoal] = useState(null)
  const [goalLoading, setGoalLoading] = useState(true)
  const [goalSaving, setGoalSaving] = useState(false)

  useEffect(() => {
    const fetchGoal = async () => {
      if (!session?.user?.id) {
        setGoalLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('reading_goals')
        .select('year_goal')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!error && data && typeof data.year_goal === 'number' && data.year_goal > 0) {
        setYearGoal(data.year_goal)
        setGoalInput(String(data.year_goal))
      } else {
        setYearGoal(null)
        setGoalInput('')
      }

      setGoalLoading(false)
    }

    fetchGoal()
  }, [session])

  const total = books.length
  const readBooks = books.filter((b) => b.status === 'read')
  const readingBooks = books.filter((b) => b.status === 'reading')
  const toreadBooks = books.filter((b) => b.status === 'toread')
  const dnfBooks = books.filter((b) => b.status === 'dnf')

  const readCount = readBooks.length
  const readingCount = readingBooks.length
  const toreadCount = toreadBooks.length
  const dnfCount = dnfBooks.length

  const pagesTotal = books.reduce((sum, b) => sum + (Number(b.pages) || 0), 0)

  const pagesRead = books.reduce((sum, b) => {
    const current = Number(b.current_page) || 0
    const totalPages = Number(b.pages) || 0
    if (totalPages > 0) return sum + Math.min(current, totalPages)
    return sum
  }, 0)

  const ratedBooks = books.filter((b) => Number(b.rating) > 0)
  const avgRating = ratedBooks.length
    ? (ratedBooks.reduce((sum, b) => sum + Number(b.rating || 0), 0) / ratedBooks.length).toFixed(1)
    : '—'

  const completionRate = total ? Math.round((readCount / total) * 100) : 0

  const genreCounts = books.reduce((acc, book) => {
    const genres = Array.isArray(book.genres) ? book.genres : []
    genres.forEach((genre) => {
      acc[genre] = (acc[genre] || 0) + 1
    })
    return acc
  }, {})

  const topGenre =
    Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const readingWithPages = books.filter(
    (b) => b.status === 'reading' && Number(b.pages) > 0
  )

  const avgReadingProgress = readingWithPages.length
    ? Math.round(
        readingWithPages.reduce((sum, b) => {
          return sum + ((Number(b.current_page) || 0) / Number(b.pages)) * 100
        }, 0) / readingWithPages.length
      )
    : 0

  const goalProgress = useMemo(() => {
    if (!yearGoal || yearGoal <= 0) return 0
    return Math.min(100, Math.round((readCount / yearGoal) * 100))
  }, [readCount, yearGoal])

  const remainingBooks = useMemo(() => {
    if (!yearGoal || yearGoal <= 0) return null
    return Math.max(0, yearGoal - readCount)
  }, [yearGoal, readCount])

  const saveGoal = async () => {
    const parsed = Number(goalInput)
    if (!parsed || parsed <= 0 || !session?.user?.id) return

    setGoalSaving(true)

    const { error } = await supabase
      .from('reading_goals')
      .upsert(
        { user_id: session.user.id, year_goal: parsed },
        { onConflict: 'user_id' }
      )

    if (!error) {
      setYearGoal(parsed)
      setGoalInput(String(parsed))
    }

    setGoalSaving(false)
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: '8px',
          }}
        >
          Dashboard
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '40px',
            lineHeight: 1,
            color: 'var(--color-text)',
            marginBottom: '10px',
          }}
        >
          Reading Stats
        </h1>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Una panoramica della tua libreria e delle tue abitudini di lettura.
        </p>
      </div>

      <div className="card" style={{ padding: '22px', marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '16px',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: '8px',
              }}
            >
              Goal annuale
            </p>

            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '30px',
                lineHeight: 1,
                color: 'var(--color-text)',
              }}
            >
              {yearGoal ? `${readCount} / ${yearGoal} libri` : 'Nessun goal impostato'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              className="input-field input-field-boxed"
              type="number"
              min="1"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Inserisci goal"
              style={{ width: '160px' }}
            />
            <button
              className="btn-primary"
              onClick={saveGoal}
              disabled={goalSaving || goalLoading}
            >
              {goalSaving ? 'Salvataggio...' : 'Salva goal'}
            </button>
          </div>
        </div>

        {yearGoal ? (
          <>
            <div
              style={{
                width: '100%',
                height: '12px',
                borderRadius: '999px',
                background: 'var(--color-surface-high)',
                overflow: 'hidden',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  width: `${goalProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))',
                  borderRadius: '999px',
                  transition: 'width 320ms ease',
                }}
              />
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {goalProgress >= 100
                ? '🎉 Hai raggiunto il tuo obiettivo annuale!'
                : `Ti mancano ${remainingBooks} ${remainingBooks === 1 ? 'libro' : 'libri'} per completare il goal. Sei al ${goalProgress}%.`}
            </p>
          </>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Inserisci quanti libri vuoi leggere quest'anno per tracciare il tuo progresso.
          </p>
        )}
      </div>

      <div className="stats-grid" style={{ marginBottom: '16px' }}>
        <StatCard label="Libri totali" value={total} hint="Tutti i libri salvati" accent />
        <StatCard label="Letti" value={readCount} hint={`${completionRate}% completati`} />
        <StatCard label="In lettura" value={readingCount} hint="Attualmente aperti" />
        <StatCard label="Interrotti" value={dnfCount} hint="DNF separati dai completati" />
      </div>

      <div className="stats-grid" style={{ marginBottom: '16px' }}>
        <StatCard label="Da leggere" value={toreadCount} hint="In lista d'attesa" />
        <StatCard label="Pagine totali" value={pagesTotal || '—'} hint="Somma stimata libreria" />
        <StatCard label="Pagine lette" value={pagesRead || 0} hint="Da current_page" />
        <StatCard label="Rating medio" value={avgRating} hint="Supporta mezze stelle" />
      </div>

      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <StatCard label="Genere top" value={topGenre} hint="Il più ricorrente in libreria" />
        <StatCard label="Avanzamento medio" value={`${avgReadingProgress}%`} hint="Solo libri in lettura" />
        <StatCard label="Goal completato" value={`${goalProgress}%`} hint="Sul goal annuale" />
        <StatCard label="Libri mancanti" value={remainingBooks ?? '—'} hint="Per chiudere il goal" />
      </div>

      <div className="card" style={{ padding: '22px' }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: '14px',
          }}
        >
          Insight
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)' }}>
            Hai completato <strong>{readCount}</strong> {readCount === 1 ? 'libro' : 'libri'} su <strong>{total}</strong> in libreria.
          </p>

          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)' }}>
            Hai letto circa <strong>{pagesRead.toLocaleString('it-IT')}</strong> {pagesRead === 1 ? 'pagina' : 'pagine'} in totale.
          </p>

          {readingCount > 0 && (
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)' }}>
              I {readingCount} {readingCount === 1 ? 'libro' : 'libri'} in lettura {readingCount === 1 ? 'è completato' : 'sono completati'} in media al <strong>{avgReadingProgress}%</strong>.
            </p>
          )}

          {dnfCount > 0 && (
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)' }}>
              Hai interrotto <strong>{dnfCount}</strong> {dnfCount === 1 ? 'libro' : 'libri'}, ma le pagine già lette restano conteggiate.
            </p>
          )}

          {topGenre !== '—' && (
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)' }}>
              Il tuo genere più presente è <strong>{topGenre}</strong>.
            </p>
          )}

          {avgRating !== '—' && (
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)' }}>
              Il tuo rating medio è <strong>{avgRating}</strong> su <strong>{ratedBooks.length}</strong> {ratedBooks.length === 1 ? 'libro valutato' : 'libri valutati'}.
            </p>
          )}

          {total === 0 && (
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Aggiungi il tuo primo libro per iniziare a vedere i tuoi dati.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
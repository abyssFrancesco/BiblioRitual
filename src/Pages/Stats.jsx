import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'

function StatCard({ label, value, hint, accent = false }) {
  return (
    <div
      className="card"
      style={{
        padding: 20,
        borderRadius: 24,
        background: accent ? 'var(--color-primary-light)' : 'var(--color-surface)',
        border: accent
          ? '1px solid rgba(45, 90, 61, 0.14)'
          : '1px solid var(--color-outline-variant)',
      }}
    >
      <p
        style={{
          margin: 0,
          marginBottom: 8,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
        }}
      >
        {label}
      </p>

      <h3
        style={{
          margin: 0,
          fontFamily: 'var(--font-serif)',
          fontSize: 30,
          lineHeight: 1.1,
          color: 'var(--color-text)',
        }}
      >
        {value}
      </h3>

      {hint && (
        <p
          style={{
            margin: 0,
            marginTop: 10,
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--color-text-muted)',
          }}
        >
          {hint}
        </p>
      )}
    </div>
  )
}

function TimelineItem({ item }) {
  return (
    <div
      style={{
        padding: '14px 0',
        borderBottom: '1px solid var(--color-outline-variant)',
      }}
    >
      <p
        style={{
          margin: 0,
          marginBottom: 4,
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--color-text)',
        }}
      >
        {item.label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: 'var(--color-text-muted)',
        }}
      >
        {item.dateLabel}
      </p>
    </div>
  )
}

function buildMinutesMap(sessions) {
  const map = new Map()

  sessions.forEach((session) => {
    const key = session.session_date
    const current = map.get(key) || 0
    map.set(key, current + Number(session.minutes_read || 0))
  })

  return map
}

function getIntensity(value) {
  if (value >= 90) return 4
  if (value >= 45) return 3
  if (value >= 20) return 2
  if (value > 0) return 1
  return 0
}

function Heatmap({ sessions }) {
  const cells = useMemo(() => {
    const map = buildMinutesMap(sessions)
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - 83)

    const startDay = start.getDay()
    const mondayOffset = startDay === 0 ? 6 : startDay - 1
    start.setDate(start.getDate() - mondayOffset)

    const result = []
    const months = []

    for (let i = 0; i < 84 + mondayOffset; i += 1) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      const key = date.toISOString().slice(0, 10)
      const value = map.get(key) || 0

      if (date.getDate() <= 7) {
        months.push({
          index: i,
          label: date.toLocaleDateString('it-IT', { month: 'short' }),
        })
      }

      result.push({
        key,
        value,
        intensity: getIntensity(value),
      })
    }

    return { result, months }
  }, [sessions])

  const colors = [
    'var(--color-surface-high)',
    '#d8e7dc',
    '#a5c5ad',
    '#6c9b77',
    'var(--color-primary)',
  ]

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div
        style={{
          position: 'relative',
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        <div style={{ display: 'grid', gap: 8, minWidth: 720 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
              gap: 8,
              paddingLeft: 42,
            }}
          >
            {Array.from({ length: 13 }).map((_, weekIndex) => {
              const monthLabel = cells.months.find(
                (month) => Math.floor(month.index / 7) === weekIndex
              )?.label

              return (
                <span
                  key={weekIndex}
                  style={{
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    textTransform: 'capitalize',
                  }}
                >
                  {monthLabel || ''}
                </span>
              )
            })}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '34px 1fr',
              gap: 8,
              alignItems: 'start',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateRows: 'repeat(7, 1fr)',
                gap: 8,
                paddingTop: 2,
              }}
            >
              {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((label, i) => (
                <span
                  key={`${label}-${i}`}
                  style={{
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    lineHeight: '12px',
                    height: 12,
                  }}
                >
                  {i % 2 === 0 ? label : ''}
                </span>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridTemplateRows: 'repeat(7, 1fr)',
                gridAutoColumns: '1fr',
                gap: 8,
              }}
            >
              {cells.result.map((cell) => (
                <div
                  key={cell.key}
                  title={`${cell.key} · ${cell.value} min`}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: colors[cell.intensity],
                    border: '1px solid rgba(45, 90, 61, 0.08)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--color-text-muted)',
          }}
        >
          Ultime 12 settimane di attività lettura.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Bassa</span>
          {colors.map((color, i) => (
            <span
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: 4,
                background: color,
                border: '1px solid rgba(45, 90, 61, 0.08)',
              }}
            />
          ))}
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Alta</span>
        </div>
      </div>
    </div>
  )
}

function computeCurrentStreak(dateSet) {
  let streak = 0
  const now = new Date()

  for (;;) {
    const key = now.toISOString().slice(0, 10)
    if (!dateSet.has(key)) break
    streak += 1
    now.setDate(now.getDate() - 1)
  }

  return streak
}

function computeBestStreak(sortedDates) {
  if (sortedDates.length === 0) return 0

  let best = 1
  let current = 1

  for (let i = 1; i < sortedDates.length; i += 1) {
    const prev = new Date(sortedDates[i - 1])
    const curr = new Date(sortedDates[i])
    const diffDays = Math.round((curr - prev) / 86400000)

    if (diffDays === 1) {
      current += 1
      best = Math.max(best, current)
    } else {
      current = 1
    }
  }

  return best
}

function formatEvent(item, books) {
  const relatedBook = books.find((book) => book.id === item.book_id)
  const title = relatedBook?.title || item.payload?.title || 'Libro'

  const labels = {
    book_added: `Hai aggiunto "${title}"`,
    status_changed: `Hai cambiato stato a "${title}"`,
    progress_updated: `Hai aggiornato il progresso di "${title}"`,
    note_added: `Hai aggiunto una nota a "${title}"`,
    book_finished: `Hai completato "${title}"`,
    book_removed: `Hai rimosso "${title}"`,
    goal_updated: 'Hai aggiornato il goal annuale',
    monthly_goal_updated: 'Hai aggiornato il goal mensile',
    session_added: `Hai registrato una sessione per "${title}"`,
  }

  const date = new Date(item.created_at)

  return {
    id: item.id,
    label: labels[item.event_type] || 'Attività registrata',
    dateLabel: date.toLocaleString('it-IT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

export default function Stats({ books, session }) {
  const [yearGoal, setYearGoal] = useState('')
  const [yearGoalInput, setYearGoalInput] = useState('')
  const [monthlyGoalBooks, setMonthlyGoalBooks] = useState('')
  const [monthlyGoalPages, setMonthlyGoalPages] = useState('')
  const [monthlyGoalBooksInput, setMonthlyGoalBooksInput] = useState('')
  const [monthlyGoalPagesInput, setMonthlyGoalPagesInput] = useState('')
  const [sessions, setSessions] = useState([])
  const [activity, setActivity] = useState([])
  const [loadingExtras, setLoadingExtras] = useState(true)
  const [savingYearGoal, setSavingYearGoal] = useState(false)
  const [savingMonthGoal, setSavingMonthGoal] = useState(false)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentMonthLabel = now.toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    if (!session?.user?.id) return

    const loadStatsExtras = async () => {
      setLoadingExtras(true)

      const [annualGoalRes, monthlyGoalRes, sessionsRes, activityRes] = await Promise.all([
        supabase
          .from('reading_goals')
          .select('goal')
          .eq('user_id', session.user.id)
          .eq('year', currentYear)
          .maybeSingle(),
        supabase
          .from('reading_goals_monthly')
          .select('books_goal, pages_goal')
          .eq('user_id', session.user.id)
          .eq('year', currentYear)
          .eq('month', currentMonth)
          .maybeSingle(),
        supabase
          .from('reading_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('session_date', { ascending: false }),
        supabase
          .from('activity_events')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(12),
      ])

      const annualValue = annualGoalRes.data?.goal ?? ''
      const monthBooks = monthlyGoalRes.data?.books_goal ?? ''
      const monthPages = monthlyGoalRes.data?.pages_goal ?? ''

      setYearGoal(annualValue)
      setYearGoalInput(String(annualValue || ''))
      setMonthlyGoalBooks(monthBooks)
      setMonthlyGoalPages(monthPages)
      setMonthlyGoalBooksInput(String(monthBooks || ''))
      setMonthlyGoalPagesInput(String(monthPages || ''))
      setSessions(sessionsRes.data || [])
      setActivity(activityRes.data || [])
      setLoadingExtras(false)
    }

    loadStatsExtras()
  }, [session, currentYear, currentMonth])

  const readBooks = useMemo(
    () => books.filter((book) => book.status === 'read'),
    [books]
  )

  const readingBooks = useMemo(
    () => books.filter((book) => book.status === 'reading'),
    [books]
  )

  const dnfBooks = useMemo(
    () => books.filter((book) => book.status === 'dnf'),
    [books]
  )

  const pagesRead = useMemo(() => {
    return books.reduce((sum, book) => {
      if (book.status === 'read') return sum + Number(book.pages || 0)
      return sum + Number(book.current_page ?? book.currentpage ?? 0)
    }, 0)
  }, [books])

  const avgReadingProgress = useMemo(() => {
    if (readingBooks.length === 0) return 0

    const total = readingBooks.reduce((sum, book) => {
      const pages = Number(book.pages || 0)
      const current = Number(book.current_page ?? book.currentpage ?? 0)
      if (!pages) return sum
      return sum + Math.min(100, Math.round((current / pages) * 100))
    }, 0)

    return Math.round(total / readingBooks.length)
  }, [readingBooks])

  const ratedBooks = useMemo(
    () => books.filter((book) => Number(book.rating || 0) > 0),
    [books]
  )

  const avgRating = useMemo(() => {
    if (ratedBooks.length === 0) return 0
    const total = ratedBooks.reduce((sum, book) => sum + Number(book.rating || 0), 0)
    return (total / ratedBooks.length).toFixed(1)
  }, [ratedBooks])

  const topGenre = useMemo(() => {
    const counts = new Map()

    books.forEach((book) => {
      const genres = Array.isArray(book.genres) ? book.genres : []
      genres.forEach((genre) => {
        counts.set(genre, (counts.get(genre) || 0) + 1)
      })
    })

    let top = '—'
    let max = 0

    counts.forEach((count, genre) => {
      if (count > max) {
        max = count
        top = genre
      }
    })

    return top
  }, [books])

  const yearGoalNumber = Number(yearGoal || 0)
  const readCount = readBooks.length
  const remainingBooks = Math.max(yearGoalNumber - readCount, 0)
  const goalProgress =
    yearGoalNumber > 0 ? Math.min(100, Math.round((readCount / yearGoalNumber) * 100)) : 0

  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

  const monthReadBooks = useMemo(() => {
    return books.filter((book) => {
      const finishedAt = book.finished_at ?? book.finishedat
      return book.status === 'read' && finishedAt?.startsWith(monthPrefix)
    }).length
  }, [books, monthPrefix])

  const monthPagesRead = useMemo(() => {
    return sessions
      .filter((s) => s.session_date?.startsWith(monthPrefix))
      .reduce((sum, s) => sum + Number(s.pages_read || 0), 0)
  }, [sessions, monthPrefix])

  const monthBooksGoalValue = Number(monthlyGoalBooks || 0)
  const monthPagesGoalValue = Number(monthlyGoalPages || 0)

  const monthBooksProgress =
    monthBooksGoalValue > 0
      ? Math.min(100, Math.round((monthReadBooks / monthBooksGoalValue) * 100))
      : 0

  const monthPagesProgress =
    monthPagesGoalValue > 0
      ? Math.min(100, Math.round((monthPagesRead / monthPagesGoalValue) * 100))
      : 0

  const sessionDateSet = useMemo(() => {
    const set = new Set()
    sessions.forEach((s) => {
      if (s.session_date) set.add(s.session_date)
    })
    return set
  }, [sessions])

  const sortedUniqueDates = useMemo(() => {
    return Array.from(sessionDateSet).sort((a, b) => new Date(a) - new Date(b))
  }, [sessionDateSet])

  const currentStreak = useMemo(
    () => computeCurrentStreak(sessionDateSet),
    [sessionDateSet]
  )

  const bestStreak = useMemo(
    () => computeBestStreak(sortedUniqueDates),
    [sortedUniqueDates]
  )

  const totalMinutesRead = useMemo(() => {
    return sessions.reduce((sum, s) => sum + Number(s.minutes_read || 0), 0)
  }, [sessions])

  const formattedActivity = useMemo(() => {
    return activity.map((item) => formatEvent(item, books))
  }, [activity, books])

  const handleSaveYearGoal = async () => {
    if (!session?.user?.id) return

    const value = Math.max(0, Number(yearGoalInput || 0))
    setSavingYearGoal(true)

    await supabase.from('reading_goals').upsert(
      {
        user_id: session.user.id,
        year: currentYear,
        goal: value,
      },
      { onConflict: 'user_id,year' }
    )

    await supabase.from('activity_events').insert({
      user_id: session.user.id,
      event_type: 'goal_updated',
      payload: { goal: value, year: currentYear },
    })

    setYearGoal(value)
    setSavingYearGoal(false)
  }

  const handleSaveMonthlyGoal = async () => {
    if (!session?.user?.id) return

    const booksValue = Math.max(0, Number(monthlyGoalBooksInput || 0))
    const pagesValue = Math.max(0, Number(monthlyGoalPagesInput || 0))

    setSavingMonthGoal(true)

    await supabase.from('reading_goals_monthly').upsert(
      {
        user_id: session.user.id,
        year: currentYear,
        month: currentMonth,
        books_goal: booksValue,
        pages_goal: pagesValue,
      },
      { onConflict: 'user_id,year,month' }
    )

    await supabase.from('activity_events').insert({
      user_id: session.user.id,
      event_type: 'monthly_goal_updated',
      payload: {
        year: currentYear,
        month: currentMonth,
        books_goal: booksValue,
        pages_goal: pagesValue,
      },
    })

    setMonthlyGoalBooks(booksValue)
    setMonthlyGoalPages(pagesValue)
    setSavingMonthGoal(false)
  }

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
          Dashboard
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
          Le tue abitudini di lettura
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.7,
            color: 'var(--color-text-muted)',
            maxWidth: 720,
          }}
        >
          Una panoramica più viva della tua libreria: progressi, obiettivi,
          costanza e attività recenti.
        </p>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <StatCard
          label="Libri letti"
          value={readCount}
          hint={`Su ${books.length} in libreria`}
          accent
        />
        <StatCard
          label="Streak attuale"
          value={`${currentStreak} gg`}
          hint={`Record: ${bestStreak} giorni consecutivi`}
        />
        <StatCard
          label="Pagine lette"
          value={pagesRead.toLocaleString('it-IT')}
          hint="Calcolate da libri finiti e progressi correnti"
        />
        <StatCard
          label="Tempo letto"
          value={`${totalMinutesRead} min`}
          hint="Basato sulle sessioni registrate"
        />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 18,
        }}
      >
        <div className="card" style={{ padding: 24, borderRadius: 24 }}>
          <p
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
            }}
          >
            Goal annuale
          </p>

          <p
            style={{
              margin: 0,
              marginBottom: 14,
              fontSize: 14,
              color: 'var(--color-text-muted)',
            }}
          >
            {yearGoalNumber
              ? `${readCount} / ${yearGoalNumber} libri`
              : 'Nessun goal impostato'}
          </p>

          <div
            style={{
              width: '100%',
              height: 10,
              borderRadius: 999,
              overflow: 'hidden',
              background: 'var(--color-surface-high)',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: `${goalProgress}%`,
                height: '100%',
                borderRadius: 999,
                background:
                  'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark))',
                transition: 'width 260ms ease',
              }}
            />
          </div>

          <p
            style={{
              margin: 0,
              marginBottom: 14,
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--color-text-muted)',
            }}
          >
            {yearGoalNumber
              ? goalProgress >= 100
                ? '🎉 Hai raggiunto il tuo obiettivo annuale.'
                : `Ti mancano ${remainingBooks} ${
                    remainingBooks === 1 ? 'libro' : 'libri'
                  } per completarlo.`
              : 'Inserisci quanti libri vuoi leggere quest’anno.'}
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="number"
              min="0"
              value={yearGoalInput}
              onChange={(e) => setYearGoalInput(e.target.value)}
              className="input-field input-field-boxed"
              placeholder="Goal annuale"
              style={{ width: 180 }}
            />
            <button className="btn-primary" onClick={handleSaveYearGoal}>
              {savingYearGoal ? 'Salvataggio...' : 'Salva goal'}
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 24, borderRadius: 24 }}>
          <p
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
            }}
          >
            Goal mensile
          </p>

          <p
            style={{
              margin: 0,
              marginBottom: 14,
              fontSize: 14,
              color: 'var(--color-text-muted)',
            }}
          >
            {currentMonthLabel}
          </p>

          <div style={{ display: 'grid', gap: 12, marginBottom: 14 }}>
            <div>
              <p style={{ margin: 0, marginBottom: 6, fontSize: 13, color: 'var(--color-text)' }}>
                Libri: {monthReadBooks} / {monthBooksGoalValue || 0}
              </p>
              <div
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: 'var(--color-surface-high)',
                }}
              >
                <div
                  style={{
                    width: `${monthBooksProgress}%`,
                    height: '100%',
                    background: 'var(--color-primary)',
                  }}
                />
              </div>
            </div>

            <div>
              <p style={{ margin: 0, marginBottom: 6, fontSize: 13, color: 'var(--color-text)' }}>
                Pagine: {monthPagesRead} / {monthPagesGoalValue || 0}
              </p>
              <div
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: 'var(--color-surface-high)',
                }}
              >
                <div
                  style={{
                    width: `${monthPagesProgress}%`,
                    height: '100%',
                    background: '#7e9f87',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <input
              type="number"
              min="0"
              value={monthlyGoalBooksInput}
              onChange={(e) => setMonthlyGoalBooksInput(e.target.value)}
              className="input-field input-field-boxed"
              placeholder="Libri nel mese"
            />
            <input
              type="number"
              min="0"
              value={monthlyGoalPagesInput}
              onChange={(e) => setMonthlyGoalPagesInput(e.target.value)}
              className="input-field input-field-boxed"
              placeholder="Pagine nel mese"
            />
            <button className="btn-primary" onClick={handleSaveMonthlyGoal}>
              {savingMonthGoal ? 'Salvataggio...' : 'Salva goal mensile'}
            </button>
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
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
            Heatmap lettura
          </p>

          <Heatmap sessions={sessions} />
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
            Insight
          </p>

          <div style={{ display: 'grid', gap: 10 }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              Hai completato <strong>{readCount}</strong> {readCount === 1 ? 'libro' : 'libri'} su{' '}
              <strong>{books.length}</strong> in libreria.
            </p>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              I {readingBooks.length} {readingBooks.length === 1 ? 'libro in lettura è' : 'libri in lettura sono'} in media al{' '}
              <strong>{avgReadingProgress}%</strong>.
            </p>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              Hai interrotto <strong>{dnfBooks.length}</strong> {dnfBooks.length === 1 ? 'libro' : 'libri'}.
            </p>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              Il genere più presente è <strong>{topGenre}</strong>.
            </p>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              Il tuo rating medio è <strong>{avgRating}</strong> su <strong>{ratedBooks.length}</strong>{' '}
              {ratedBooks.length === 1 ? 'libro valutato' : 'libri valutati'}.
            </p>
          </div>
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
          Timeline attività
        </p>

        {loadingExtras ? (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)' }}>
            Caricamento attività...
          </p>
        ) : formattedActivity.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)' }}>
            Nessuna attività registrata ancora. La timeline si popolerà quando inizierai
            a registrare goal, sessioni e aggiornamenti.
          </p>
        ) : (
          formattedActivity.map((item) => <TimelineItem key={item.id} item={item} />)
        )}
      </section>
    </div>
  )
}
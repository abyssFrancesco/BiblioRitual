import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Settings({ session, preferences, setPreferences }) {
  const [theme, setTheme] = useState(preferences?.theme ?? 'auto')
  const [discoverLanguage, setDiscoverLanguage] = useState(
    preferences?.discover_language ?? 'it'
  )
  const [aiEnabled, setAiEnabled] = useState(Boolean(preferences?.ai_enabled))
  const [confirmBeforeRemove, setConfirmBeforeRemove] = useState(
    preferences?.confirm_before_remove ?? true
  )
  const [confirmBeforeLogout, setConfirmBeforeLogout] = useState(
    preferences?.confirm_before_logout ?? true
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setTheme(preferences?.theme ?? 'auto')
    setDiscoverLanguage(preferences?.discover_language ?? 'it')
    setAiEnabled(Boolean(preferences?.ai_enabled))
    setConfirmBeforeRemove(preferences?.confirm_before_remove ?? true)
    setConfirmBeforeLogout(preferences?.confirm_before_logout ?? true)
  }, [preferences])

  const savePreferences = async () => {
    if (!session?.user?.id) return

    setSaving(true)
    setSaved(false)

    const payload = {
      user_id: session.user.id,
      theme,
      discover_language: discoverLanguage,
      ai_enabled: aiEnabled,
      confirm_before_remove: confirmBeforeRemove,
      confirm_before_logout: confirmBeforeLogout,
    }

    const { error } = await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })

    if (!error) {
      setPreferences((prev) => ({
        ...prev,
        ...payload,
      }))
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    }

    setSaving(false)
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
          Settings
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
          Preferenze dell’esperienza
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
          Qui controlli tema, discover e i comportamenti base dell’app.
        </p>
      </section>

      <section className="card" style={{ padding: 24, borderRadius: 24 }}>
        <div style={{ display: 'grid', gap: 20, maxWidth: 620 }}>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--color-text)',
              }}
            >
              Tema
            </label>

            <select
              className="input-field input-field-boxed"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="auto">Automatico</option>
              <option value="light">Chiaro</option>
              <option value="dark">Scuro</option>
            </select>

            <p
              style={{
                margin: '8px 0 0',
                fontSize: 13,
                color: 'var(--color-text-muted)',
              }}
            >
              Cambia subito l’aspetto dell’interfaccia.
            </p>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--color-text)',
              }}
            >
              Lingua preferita per Discover
            </label>

            <select
              className="input-field input-field-boxed"
              value={discoverLanguage}
              onChange={(e) => setDiscoverLanguage(e.target.value)}
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>

            <p
              style={{
                margin: '8px 0 0',
                fontSize: 13,
                color: 'var(--color-text-muted)',
              }}
            >
              Influisce sui suggerimenti, sui testi discovery e sulle future funzioni AI.
            </p>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 14,
              color: 'var(--color-text)',
            }}
          >
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
            />
            Attiva AI leggera quando disponibile
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 14,
              color: 'var(--color-text)',
            }}
          >
            <input
              type="checkbox"
              checked={confirmBeforeRemove}
              onChange={(e) => setConfirmBeforeRemove(e.target.checked)}
            />
            Conferma prima di rimuovere un libro
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 14,
              color: 'var(--color-text)',
            }}
          >
            <input
              type="checkbox"
              checked={confirmBeforeLogout}
              onChange={(e) => setConfirmBeforeLogout(e.target.checked)}
            />
            Conferma prima del logout
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
            <button className="btn-primary" onClick={savePreferences}>
              {saving ? 'Salvataggio...' : 'Salva preferenze'}
            </button>

            {saved && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                }}
              >
                Salvato
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
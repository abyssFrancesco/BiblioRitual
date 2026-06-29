import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Stats from './pages/Stats'
import Discover from './pages/Discover'
import Settings from './pages/Settings'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import ConfirmDialog from './components/ConfirmDialog'
import { useBooks } from './hooks/useBooks'
import { supabase } from './supabase'

const DEFAULT_PREFERENCES = {
  theme: 'auto',
  discover_language: 'it',
  ai_enabled: false,
  confirm_before_remove: true,
  confirm_before_logout: true,
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES)
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user?.id) {
      setPreferences(DEFAULT_PREFERENCES)
      setPreferencesLoaded(true)
      return
    }

    const loadPreferences = async () => {
      setPreferencesLoaded(false)

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('Errore caricamento preferenze:', error)
        setPreferences(DEFAULT_PREFERENCES)
        setPreferencesLoaded(true)
        return
      }

      if (data) {
        setPreferences({
          theme: data.theme ?? 'auto',
          discover_language: data.discover_language ?? 'it',
          ai_enabled: Boolean(data.ai_enabled),
          confirm_before_remove:
            data.confirm_before_remove === null
              ? true
              : Boolean(data.confirm_before_remove),
          confirm_before_logout:
            data.confirm_before_logout === null
              ? true
              : Boolean(data.confirm_before_logout),
        })
      } else {
        setPreferences(DEFAULT_PREFERENCES)
      }

      setPreferencesLoaded(true)
    }

    loadPreferences()
  }, [session])

  useEffect(() => {
    const root = document.documentElement
    const theme = preferences?.theme ?? 'auto'

    if (theme === 'auto') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [preferences])

  const requestSignOut = async () => {
    if (!(preferences?.confirm_before_logout ?? true)) {
      await supabase.auth.signOut({ scope: 'local' })
      return
    }

    setShowLogoutConfirm(true)
  }

  const confirmSignOut = async () => {
    setShowLogoutConfirm(false)
    await supabase.auth.signOut({ scope: 'local' })
  }

  const {
    books,
    loading,
    refreshing,
    addBook,
    removeBook,
    updateRating,
    updateStatus,
    updateProgress,
  } = useBooks(session)

  if (session === undefined || !preferencesLoaded) return null
  if (!session) return <Login />

  return (
    <>
      <div className="app-shell">
        <Sidebar onLogout={requestSignOut} />

        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  session={session}
                  books={books}
                  loading={loading}
                  refreshing={refreshing}
                  addBook={addBook}
                  updateRating={updateRating}
                  updateStatus={updateStatus}
                  updateProgress={updateProgress}
                  removeBook={removeBook}
                  preferences={preferences}
                />
              }
            />

            <Route
              path="/stats"
              element={
                <Stats
                  books={books}
                  session={session}
                  preferences={preferences}
                />
              }
            />

            <Route
              path="/discover"
              element={
                <Discover
                  books={books}
                  session={session}
                  preferences={preferences}
                />
              }
            />

            <Route
              path="/settings"
              element={
                <Settings
                  session={session}
                  preferences={preferences}
                  setPreferences={setPreferences}
                />
              }
            />
          </Routes>
        </main>
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Vuoi uscire da BiblioRitual?"
        message="Verrai disconnesso dalla sessione corrente su questo dispositivo."
        confirmLabel="Esci"
        cancelLabel="Resta qui"
        danger={false}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmSignOut}
      />
    </>
  )
}
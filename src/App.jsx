import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Stats from './pages/Stats'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import { useBooks } from './hooks/useBooks'
import { supabase } from './supabase'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
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
  } = useBooks(session)

  if (session === undefined) return null

  if (!session) {
    return <Login />
  }

  return (
    <div className="app-layout">
      <Sidebar onLogout={signOut} />

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                books={books}
                loading={loading}
                refreshing={refreshing}
                addBook={addBook}
                removeBook={removeBook}
                updateRating={updateRating}
                updateStatus={updateStatus}
              />
            }
          />

          <Route
            path="/stats"
            element={
              <Stats
                books={books}
                session={session}
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}
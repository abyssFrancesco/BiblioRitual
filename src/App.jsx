import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { useBooks } from './hooks/useBooks'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Login from './pages/Login'

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(false)

  const { books, addBook, removeBook, updateRating, updateStatus } = useBooks(session)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const logout = () => {
    supabase.auth.signOut()
    localStorage.removeItem('biblioritual_books')
  }

  if (authLoading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--color-bg)' }}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px',
        color: 'var(--color-text-muted)' }}>Caricamento...</p>
    </div>
  )

  if (!session) return <Login />

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar onLogout={logout} onAddBook={() => setShowSearch(true)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <Home
                books={books}
                addBook={addBook}
                updateRating={updateRating}
                updateStatus={updateStatus}
                removeBook={removeBook}
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                onAddBook={() => setShowSearch(true)}
              />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
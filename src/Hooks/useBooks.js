import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CACHE_KEY = 'biblioritual_books'

function saveToCache(books) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(books))
  } catch {}
}

function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useBooks(session) {
  const [books, setBooks] = useState(() => loadFromCache() || [])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!session) {
      setBooks([])
      setLoading(false)
      return
    }

    fetchBooks()
  }, [session])

  const logActivity = async ({ eventType, book, payload = {} }) => {
    if (!session?.user?.id) return

    await supabase.from('activity_events').insert({
      user_id: session.user.id,
      book_id: book?.id ?? null,
      event_type: eventType,
      payload: {
        title: book?.title ?? null,
        author: book?.author ?? null,
        ...payload,
      },
    })
  }

  const createReadingSessionIfNeeded = async ({
    book,
    oldPage,
    newPage,
  }) => {
    if (!session?.user?.id || !book) return

    const previous = Number(oldPage || 0)
    const current = Number(newPage || 0)
    const delta = current - previous

    if (delta <= 0) return

    await supabase.from('reading_sessions').insert({
      user_id: session.user.id,
      book_id: book.id,
      session_date: new Date().toISOString().slice(0, 10),
      pages_read: delta,
      minutes_read: 0,
      notes: null,
    })

    await logActivity({
      eventType: 'session_added',
      book,
      payload: {
        pages_read: delta,
      },
    })
  }

  const fetchBooks = async () => {
    setRefreshing(true)

    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('added_at', { ascending: false })

    if (!error) {
      setBooks(data || [])
      saveToCache(data || [])
    }

    setLoading(false)
    setRefreshing(false)
  }

  const addBook = async (book) => {
    const payload = {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description || '',
      cover_id: book.coverId || null,
      rating: 0,
      status: 'toread',
      year: book.year || null,
      pages: book.pages || null,
      genres: Array.isArray(book.genres) ? book.genres : [],
      current_page: 0,
      started_at: null,
      finished_at: null,
      shelves: [],
    }

    const { data, error } = await supabase
      .from('books')
      .insert([payload])
      .select()

    if (!error && data?.[0]) {
      const insertedBook = data[0]
      const updated = [insertedBook, ...books]
      setBooks(updated)
      saveToCache(updated)

      await logActivity({
        eventType: 'book_added',
        book: insertedBook,
      })
    }
  }

  const removeBook = async (bookId, options = {}) => {
    const book = books.find((b) => b.id === bookId)
    if (!book) return { ok: false }

    const { skipActivity = false } = options

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)

    if (!error) {
      const updated = books.filter((b) => b.id !== bookId)
      setBooks(updated)
      saveToCache(updated)

      if (!skipActivity) {
        await logActivity({
          eventType: 'book_removed',
          book,
        })
      }

      return { ok: true }
    }

    return { ok: false, error }
  }

  const updateRating = async (bookId, rating) => {
    const numericRating = Number(rating) || 0

    const { error } = await supabase
      .from('books')
      .update({ rating: numericRating })
      .eq('id', bookId)

    if (!error) {
      const updated = books.map((b) =>
        b.id === bookId ? { ...b, rating: numericRating } : b
      )
      setBooks(updated)
      saveToCache(updated)
    }
  }

  const updateStatus = async (bookId, status) => {
    const book = books.find((b) => b.id === bookId)
    if (!book) return

    const patch = { status }
    const today = new Date().toISOString().slice(0, 10)

    if (status === 'reading') {
      if (!book.started_at) patch.started_at = today
      if (book.finished_at) patch.finished_at = null
    }

    if (status === 'read') {
      const totalPages = Number(book.pages) || 0

      if (totalPages > 0) {
        patch.current_page = totalPages
      }

      if (!book.started_at) patch.started_at = today
      patch.finished_at = today
    }

    if (status === 'toread') {
      patch.finished_at = null
    }

    if (status === 'dnf') {
      patch.finished_at = null
    }

    const { error } = await supabase
      .from('books')
      .update(patch)
      .eq('id', bookId)

    if (!error) {
      const updatedBook = { ...book, ...patch }
      const updated = books.map((b) => (b.id === bookId ? updatedBook : b))
      setBooks(updated)
      saveToCache(updated)

      await logActivity({
        eventType: status === 'read' ? 'book_finished' : 'status_changed',
        book: updatedBook,
        payload: {
          status,
        },
      })
    }
  }

  const updateProgress = async (bookId, currentPage) => {
    const book = books.find((b) => b.id === bookId)
    if (!book) return

    const oldPage = Number(book.current_page ?? book.currentpage ?? 0)
    const totalPages = Number(book.pages) || 0
    let safePage = Number(currentPage) || 0

    if (safePage < 0) safePage = 0
    if (totalPages > 0 && safePage > totalPages) safePage = totalPages

    const patch = { current_page: safePage }
    const today = new Date().toISOString().slice(0, 10)

    if (totalPages > 0 && safePage >= totalPages) {
      patch.status = 'read'
      patch.current_page = totalPages
      if (!book.started_at) patch.started_at = today
      patch.finished_at = today
    } else if (safePage > 0 && (book.status === 'toread' || book.status === 'dnf')) {
      patch.status = 'reading'
      if (!book.started_at) patch.started_at = today
      if (book.finished_at) patch.finished_at = null
    }

    const { error } = await supabase
      .from('books')
      .update(patch)
      .eq('id', bookId)

    if (!error) {
      const updatedBook = { ...book, ...patch }
      const updated = books.map((b) => (b.id === bookId ? updatedBook : b))
      setBooks(updated)
      saveToCache(updated)

      await logActivity({
        eventType: patch.status === 'read' && book.status !== 'read'
          ? 'book_finished'
          : 'progress_updated',
        book: updatedBook,
        payload: {
          previous_page: oldPage,
          current_page: patch.current_page,
          total_pages: totalPages || null,
          status: updatedBook.status,
        },
      })

      await createReadingSessionIfNeeded({
        book: updatedBook,
        oldPage,
        newPage: patch.current_page,
      })
    }
  }

  const updateShelves = async (bookId, shelves) => {
    const cleanShelves = Array.isArray(shelves)
      ? [...new Set(shelves.map((s) => s.trim()).filter(Boolean))]
      : []

    const { error } = await supabase
      .from('books')
      .update({ shelves: cleanShelves })
      .eq('id', bookId)

    if (!error) {
      const updated = books.map((b) =>
        b.id === bookId ? { ...b, shelves: cleanShelves } : b
      )
      setBooks(updated)
      saveToCache(updated)
    }
  }

  return {
    books,
    loading,
    refreshing,
    addBook,
    removeBook,
    updateRating,
    updateStatus,
    updateProgress,
    updateShelves,
  }
}
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
      setRefreshing(false)
      return
    }
    fetchBooks(true)
  }, [session])

  const fetchBooks = async (initial = false) => {
    if (initial) setLoading(true)
    else setRefreshing(true)

    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('added_at', { ascending: false })

    if (!error && data) {
      setBooks(data)
      saveToCache(data)
    }

    if (initial) setLoading(false)
    else setRefreshing(false)
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
    }

    const { data, error } = await supabase
      .from('books')
      .insert([payload])
      .select()

    if (!error && data?.[0]) {
      const updated = [data[0], ...books]
      setBooks(updated)
      saveToCache(updated)
    }
  }

  const removeBook = async (bookId) => {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)

    if (!error) {
      const updated = books.filter(b => b.id !== bookId)
      setBooks(updated)
      saveToCache(updated)
    }
  }

  const updateRating = async (bookId, rating) => {
    const { error } = await supabase
      .from('books')
      .update({ rating })
      .eq('id', bookId)

    if (!error) {
      const updated = books.map(b => b.id === bookId ? { ...b, rating } : b)
      setBooks(updated)
      saveToCache(updated)
    }
  }

  const updateStatus = async (bookId, status) => {
    const { error } = await supabase
      .from('books')
      .update({ status })
      .eq('id', bookId)

    if (!error) {
      const updated = books.map(b => b.id === bookId ? { ...b, status } : b)
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
    fetchBooks,
  }
}
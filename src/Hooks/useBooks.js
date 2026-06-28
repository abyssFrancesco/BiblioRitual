import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CACHE_KEY = 'biblioritual_books'

function saveToCache(books) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(books)) } catch {}
}

function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function useBooks(session) {
  const [books, setBooks] = useState(() => loadFromCache() || [])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) { setBooks([]); setLoading(false); return }
    fetchBooks()
  }, [session])

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books').select('*').order('added_at', { ascending: false })
    if (!error) {
      setBooks(data)
      saveToCache(data)
    }
    setLoading(false)
  }

  const addBook = async (book) => {
    const { data, error } = await supabase.from('books').insert([{
      id: book.id, title: book.title, author: book.author,
      description: book.description || '',
      cover_id: book.coverId || null,
      rating: 0, status: 'toread',
    }]).select()
    if (!error) {
      const updated = [data[0], ...books]
      setBooks(updated)
      saveToCache(updated)
    }
  }

  const removeBook = async (bookId) => {
    const { error } = await supabase.from('books').delete().eq('id', bookId)
    if (!error) {
      const updated = books.filter(b => b.id !== bookId)
      setBooks(updated)
      saveToCache(updated)
    }
  }

  const updateRating = async (bookId, rating) => {
    const { error } = await supabase.from('books').update({ rating }).eq('id', bookId)
    if (!error) {
      const updated = books.map(b => b.id === bookId ? { ...b, rating } : b)
      setBooks(updated)
      saveToCache(updated)
    }
  }

  const updateStatus = async (bookId, status) => {
    const { error } = await supabase.from('books').update({ status }).eq('id', bookId)
    if (!error) {
      const updated = books.map(b => b.id === bookId ? { ...b, status } : b)
      setBooks(updated)
      saveToCache(updated)
    }
  }

  return { books, loading, addBook, removeBook, updateRating, updateStatus }
}
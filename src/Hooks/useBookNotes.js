import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useBookNotes(bookId, session, bookMeta = null) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!bookId || !session?.user?.id) {
      setNotes([])
      setLoading(false)
      return
    }

    fetchNotes()
  }, [bookId, session?.user?.id])

  const fetchNotes = async () => {
    if (!bookId) return

    setLoading(true)

    const { data, error } = await supabase
      .from('book_notes')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })

    if (!error) {
      setNotes(data || [])
    }

    setLoading(false)
  }

  const addNote = async ({ content, page }) => {
    if (!session?.user?.id || !bookId) return
    if (!content?.trim()) return

    const payload = {
      book_id: bookId,
      user_id: session.user.id,
      content: content.trim(),
      page: page ? Number(page) : null,
    }

    const { data, error } = await supabase
      .from('book_notes')
      .insert(payload)
      .select()

    if (!error && data?.[0]) {
      const inserted = data[0]
      setNotes((prev) => [inserted, ...prev])

      await supabase.from('activity_events').insert({
        user_id: session.user.id,
        book_id: bookId,
        event_type: 'note_added',
        payload: {
          title: bookMeta?.title ?? null,
          author: bookMeta?.author ?? null,
          page: inserted.page ?? null,
        },
      })
    }
  }

  const removeNote = async (noteId) => {
    const { error } = await supabase
      .from('book_notes')
      .delete()
      .eq('id', noteId)

    if (!error) {
      setNotes((prev) => prev.filter((note) => note.id !== noteId))
    }
  }

  return {
    notes,
    loading,
    addNote,
    removeNote,
  }
}
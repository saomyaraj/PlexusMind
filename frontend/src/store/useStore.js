import { create } from 'zustand'
import { createNote, getNotes, getGraphData } from '../services/api'

const useStore = create((set, get) => ({
  notes: [],
  graphData: { nodes: [], links: [] },
  loading: false,
  error: null,
  selectedNote: null,

  // Notes actions
  addNote: async (noteData) => {
    set({ loading: true, error: null })
    try {
      const newNote = await createNote(noteData)
      set(state => ({ 
        notes: [newNote, ...state.notes],
        loading: false 
      }))
      await get().refreshGraphData() // Refresh graph after adding note
      return newNote
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  fetchNotes: async () => {
    set({ loading: true, error: null })
    try {
      const notes = await getNotes()
      set({ notes, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Graph actions
  refreshGraphData: async () => {
    set({ loading: true, error: null })
    try {
      const graphData = await getGraphData()
      set({ graphData, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  selectNote: (noteId) => {
    const note = get().notes.find(n => n._id === noteId)
    set({ selectedNote: note })
  },

  clearSelection: () => {
    set({ selectedNote: null })
  }
}))

export default useStore
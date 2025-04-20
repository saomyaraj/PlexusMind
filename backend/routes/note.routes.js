// routes/note.routes.js
//----------------------------------------------------
const express = require('express');
const router = express.Router();
const { 
    createNote,
    getNotes,
    getNote,
    updateNote,
    deleteNote,
    getRelatedNotes 
} = require('../controllers/note.controller');

// Get all notes
router.get('/', getNotes);

// Get a single note
router.get('/:id', getNote);

// Create a new note
router.post('/', createNote);

// Update a note
router.put('/:id', updateNote);

// Delete a note
router.delete('/:id', deleteNote);

// Get related notes
router.get('/:id/related', getRelatedNotes);

module.exports = router;
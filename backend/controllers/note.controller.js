// controllers/note.controller.js
//----------------------------------------------------
const Note = require('../models/Note.model');
const Relationship = require('../models/Relationship.model');
const nlpService = require('../services/nlp.service');

// @desc    Create a new note
// @route   POST /api/notes
// @access  Public (Add Auth later)
exports.createNote = async (req, res) => {
    try {
        const { title, content, tags = [] } = req.body;

        // Process text with NLP service
        const nlpResults = await nlpService.processText(content);
        
        // Create note with NLP results
        const note = new Note({
            title,
            content,
            tags: [...tags, ...nlpResults.tags],
            entities: nlpResults.entities,
            keyPhrases: nlpResults.key_phrases
        });

        await note.save();

        // Find and create relationships with existing notes
        const existingNotes = await Note.find({ _id: { $ne: note._id } });
        
        for (const existingNote of existingNotes) {
            const relationship = await nlpService.findRelationships(note.content, existingNote.content);
            
            if (relationship.similarity > 0.4) { // Threshold for relationship creation
                const newRelationship = new Relationship({
                    sourceNoteId: note._id,
                    targetNoteId: existingNote._id,
                    relationshipType: relationship.relationship_type,
                    similarity: relationship.similarity,
                    sharedEntities: relationship.shared_entities
                });
                await newRelationship.save();
            }
        }

        res.status(201).json(note);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ message: 'Error creating note', error: error.message });
    }
};

// @desc    Get all notes
// @route   GET /api/notes
// @access  Public
exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes', error: error.message });
    }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Public
exports.getNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching note', error: error.message });
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Public
exports.updateNote = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        
        // Process updated content with NLP
        const nlpResults = await nlpService.processText(content);
        
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            {
                title,
                content,
                tags: [...(tags || []), ...nlpResults.tags],
                entities: nlpResults.entities,
                keyPhrases: nlpResults.key_phrases,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Update relationships
        await Relationship.deleteMany({
            $or: [
                { sourceNoteId: note._id },
                { targetNoteId: note._id }
            ]
        });

        const existingNotes = await Note.find({ _id: { $ne: note._id } });
        
        for (const existingNote of existingNotes) {
            const relationship = await nlpService.findRelationships(note.content, existingNote.content);
            
            if (relationship.similarity > 0.4) {
                const newRelationship = new Relationship({
                    sourceNoteId: note._id,
                    targetNoteId: existingNote._id,
                    relationshipType: relationship.relationship_type,
                    similarity: relationship.similarity,
                    sharedEntities: relationship.shared_entities
                });
                await newRelationship.save();
            }
        }

        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Error updating note', error: error.message });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Public
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Delete associated relationships
        await Relationship.deleteMany({
            $or: [
                { sourceNoteId: note._id },
                { targetNoteId: note._id }
            ]
        });

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting note', error: error.message });
    }
};

// @desc    Get related notes
// @route   GET /api/notes/:id/related
// @access  Public
exports.getRelatedNotes = async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);
        
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const relationships = await Relationship.find({
            $or: [
                { sourceNoteId: noteId },
                { targetNoteId: noteId }
            ]
        }).populate('sourceNoteId targetNoteId');

        const relatedNotes = relationships.map(rel => {
            const otherNote = rel.sourceNoteId.equals(noteId) ? rel.targetNoteId : rel.sourceNoteId;
            return {
                note: otherNote,
                relationship: {
                    type: rel.relationshipType,
                    similarity: rel.similarity,
                    sharedEntities: rel.sharedEntities
                }
            };
        });

        res.json(relatedNotes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching related notes', error: error.message });
    }
};
// controllers/link.controller.js
//----------------------------------------------------
const Relationship = require('../models/Relationship.model');
const Note = require('../models/Note.model');
const mongoose = require('mongoose');
const nlpService = require('../services/nlp.service');

// @desc    Create a manual link between two notes
// @route   POST /api/links
// @access  Public (Add Auth later)
exports.createManualLink = async (req, res) => {
    try {
        const { sourceNoteId, targetNoteId, metadata } = req.body;

        // Validate that both notes exist
        const [sourceNote, targetNote] = await Promise.all([
            Note.findById(sourceNoteId),
            Note.findById(targetNoteId)
        ]);

        if (!sourceNote || !targetNote) {
            return res.status(404).json({ message: 'One or both notes not found' });
        }

        // Calculate similarity using NLP service
        const similarity = await nlpService.findRelationships(
            sourceNote.content,
            targetNote.content
        );

        const relationship = new Relationship({
            sourceNoteId,
            targetNoteId,
            relationshipType: 'manual',
            similarity: similarity.similarity,
            sharedEntities: similarity.shared_entities,
            metadata: {
                ...metadata,
                createdBy: 'user', // Replace with actual user ID when auth is implemented
                lastUpdated: new Date()
            }
        });

        await relationship.save();
        res.status(201).json(relationship);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'Relationship already exists between these notes' });
        }
        res.status(500).json({ message: 'Error creating link', error: error.message });
    }
};

// @desc    Get all links for a specific note
// @route   GET /api/links/:noteId
// @access  Public (Add Auth later)
exports.getLinksForNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const relationships = await Relationship.findByNoteId(noteId);
        
        const enrichedRelationships = relationships.map(rel => ({
            id: rel._id,
            sourceNote: {
                id: rel.sourceNoteId._id,
                title: rel.sourceNoteId.title
            },
            targetNote: {
                id: rel.targetNoteId._id,
                title: rel.targetNoteId.title
            },
            type: rel.relationshipType,
            similarity: rel.similarity,
            sharedEntities: rel.sharedEntities,
            metadata: rel.metadata
        }));

        res.json(enrichedRelationships);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching links', error: error.message });
    }
};

// @desc    Update a link's metadata
// @route   PATCH /api/links/:linkId
// @access  Public (Add Auth later)
exports.updateLink = async (req, res) => {
    try {
        const { linkId } = req.params;
        const { metadata } = req.body;

        const relationship = await Relationship.findById(linkId);
        if (!relationship) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        // Update metadata while preserving original creation info
        relationship.metadata = {
            ...relationship.metadata,
            ...metadata,
            lastUpdated: new Date()
        };

        await relationship.save();
        res.json(relationship);
    } catch (error) {
        res.status(500).json({ message: 'Error updating link', error: error.message });
    }
};

// @desc    Delete a link by its ID
// @route   DELETE /api/links/:linkId
// @access  Public (Add Auth later)
exports.deleteLink = async (req, res) => {
    try {
        const { linkId } = req.params;
        const relationship = await Relationship.findByIdAndDelete(linkId);
        
        if (!relationship) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        res.json({ message: 'Relationship deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting link', error: error.message });
    }
};

// @desc    Get strongest links above a similarity threshold
// @route   GET /api/links/strongest?threshold=0.7
// @access  Public (Add Auth later)
exports.getStrongestLinks = async (req, res) => {
    try {
        const { threshold = 0.7 } = req.query;
        const relationships = await Relationship.findStrongestRelationships(parseFloat(threshold));

        const enrichedRelationships = relationships.map(rel => ({
            id: rel._id,
            sourceNote: {
                id: rel.sourceNoteId._id,
                title: rel.sourceNoteId.title,
                preview: rel.sourceNoteId.content.substring(0, 100) + '...'
            },
            targetNote: {
                id: rel.targetNoteId._id,
                title: rel.targetNoteId.title,
                preview: rel.targetNoteId.content.substring(0, 100) + '...'
            },
            type: rel.relationshipType,
            similarity: rel.similarity,
            sharedEntities: rel.sharedEntities,
            metadata: rel.metadata
        }));

        res.json(enrichedRelationships);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching strongest links', error: error.message });
    }
};
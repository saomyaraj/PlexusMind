// models/Relationship.model.js
//----------------------------------------------------
const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
    sourceNoteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: true
    },
    targetNoteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: true
    },
    relationshipType: {
        type: String,
        enum: ['very_similar', 'related', 'somewhat_related', 'manual'],
        required: true
    },
    similarity: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    },
    sharedEntities: [{
        text: String,
        label: String
    }],
    metadata: {
        createdBy: String,
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});

// Compound index to ensure unique relationships between the same notes
relationshipSchema.index(
    { sourceNoteId: 1, targetNoteId: 1 },
    { unique: true }
);

// Index for querying relationships by either note
relationshipSchema.index({ sourceNoteId: 1 });
relationshipSchema.index({ targetNoteId: 1 });

// Index for filtering by similarity
relationshipSchema.index({ similarity: -1 });

// Static method to find all relationships for a note
relationshipSchema.statics.findByNoteId = async function(noteId) {
    return this.find({
        $or: [
            { sourceNoteId: noteId },
            { targetNoteId: noteId }
        ]
    }).populate('sourceNoteId targetNoteId');
};

// Static method to find strongest relationships
relationshipSchema.statics.findStrongestRelationships = async function(threshold = 0.7) {
    return this.find({
        similarity: { $gte: threshold }
    })
    .sort({ similarity: -1 })
    .populate('sourceNoteId targetNoteId');
};

// Instance method to get the other note in the relationship
relationshipSchema.methods.getOtherNote = function(noteId) {
    if (this.sourceNoteId.equals(noteId)) {
        return this.targetNoteId;
    }
    return this.sourceNoteId;
};

// Pre-save middleware to ensure sourceNoteId and targetNoteId are different
relationshipSchema.pre('save', function(next) {
    if (this.sourceNoteId.equals(this.targetNoteId)) {
        next(new Error('Source and target notes must be different'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Relationship', relationshipSchema);
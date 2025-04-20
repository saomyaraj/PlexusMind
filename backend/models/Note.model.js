// models/Note.model.js
//----------------------------------------------------
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    tags: [{
        type: String,
        trim: true
    }],
    entities: [{
        text: String,
        label: String,
        confidence: Number,
        start: Number,
        end: Number
    }],
    keyPhrases: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for text search
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Virtual for related notes
noteSchema.virtual('relationships', {
    ref: 'Relationship',
    localField: '_id',
    foreignField: 'sourceNoteId'
});

// Pre-save middleware to update timestamps
noteSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Instance method to find related notes
noteSchema.methods.findRelated = async function(similarityThreshold = 0.4) {
    const Relationship = mongoose.model('Relationship');
    return await Relationship.find({
        $or: [
            { sourceNoteId: this._id },
            { targetNoteId: this._id }
        ],
        similarity: { $gte: similarityThreshold }
    }).populate('sourceNoteId targetNoteId');
};

// Static method to search notes
noteSchema.statics.searchByText = async function(query) {
    return this.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Note', noteSchema);
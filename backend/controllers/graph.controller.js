// controllers/graph.controller.js
//----------------------------------------------------
const Note = require('../models/Note.model');
const Relationship = require('../models/Relationship.model');
const nlpService = require('../services/nlp.service');

exports.getGraphData = async (req, res) => {
    try {
        const notes = await Note.find({}, 'title content tags entities');
        const relationships = await Relationship.find({});

        // Create nodes for notes and entities
        const nodes = [];
        const links = [];
        const seenEntities = new Set();

        // Add note nodes
        notes.forEach(note => {
            nodes.push({
                id: note._id.toString(),
                label: note.title || 'Untitled Note',
                type: 'note',
                tags: note.tags
            });

            // Add entity nodes and connections
            note.entities.forEach(entity => {
                const entityId = `entity_${entity.text}`;
                if (!seenEntities.has(entityId)) {
                    nodes.push({
                        id: entityId,
                        label: entity.text,
                        type: 'entity',
                        entityType: entity.label
                    });
                    seenEntities.add(entityId);
                }

                links.push({
                    source: note._id.toString(),
                    target: entityId,
                    type: 'contains_entity',
                    confidence: entity.confidence
                });
            });
        });

        // Add relationship links between notes
        relationships.forEach(rel => {
            links.push({
                source: rel.sourceNoteId.toString(),
                target: rel.targetNoteId.toString(),
                type: rel.relationshipType,
                similarity: rel.similarity,
                sharedEntities: rel.sharedEntities
            });
        });

        res.json({ nodes, links });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching graph data', error: error.message });
    }
};

exports.analyzeGraph = async (req, res) => {
    try {
        const notes = await Note.find({}, 'title content');
        const texts = notes.map(note => note.content);
        
        // Get clusters of related notes
        const clusters = await nlpService.clusterNotes(texts);
        
        // Map cluster indices back to note information
        const enrichedClusters = clusters.clusters.map(cluster => ({
            ...cluster,
            notes: cluster.indices.map(idx => ({
                id: notes[idx]._id,
                title: notes[idx].title
            }))
        }));

        res.json({
            clusters: enrichedClusters
        });
    } catch (error) {
        res.status(500).json({ message: 'Error analyzing graph', error: error.message });
    }
};

exports.getCloselyRelatedNotes = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { similarityThreshold = 0.7 } = req.query;

        const relationships = await Relationship.find({
            $or: [{ sourceNoteId: noteId }, { targetNoteId: noteId }],
            similarity: { $gte: parseFloat(similarityThreshold) }
        }).populate('sourceNoteId targetNoteId');

        const relatedNotes = relationships.map(rel => {
            const otherNote = rel.sourceNoteId.equals(noteId) ? rel.targetNoteId : rel.sourceNoteId;
            return {
                note: {
                    id: otherNote._id,
                    title: otherNote.title,
                    content: otherNote.content.substring(0, 200) + '...' // Preview
                },
                similarity: rel.similarity,
                relationshipType: rel.relationshipType,
                sharedEntities: rel.sharedEntities
            };
        });

        res.json(relatedNotes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching closely related notes', error: error.message });
    }
};

exports.findPathBetweenNotes = async (req, res) => {
    try {
        const { sourceId, targetId } = req.params;
        
        // Build graph adjacency list
        const relationships = await Relationship.find();
        const graph = new Map();
        
        relationships.forEach(rel => {
            const source = rel.sourceNoteId.toString();
            const target = rel.targetNoteId.toString();
            
            if (!graph.has(source)) graph.set(source, []);
            if (!graph.has(target)) graph.set(target, []);
            
            graph.get(source).push({ id: target, relationship: rel });
            graph.get(target).push({ id: source, relationship: rel });
        });

        // Perform BFS to find shortest path
        const queue = [[sourceId]];
        const visited = new Set([sourceId]);
        const paths = [];
        
        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];
            
            if (current === targetId) {
                paths.push(path);
                continue;
            }
            
            const neighbors = graph.get(current) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    queue.push([...path, neighbor.id]);
                }
            }
        }

        if (paths.length === 0) {
            return res.json({ paths: [] });
        }

        // Enrich paths with note information
        const enrichedPaths = await Promise.all(paths.map(async path => {
            const notes = await Note.find({ _id: { $in: path } }, 'title');
            return path.map(noteId => {
                const note = notes.find(n => n._id.toString() === noteId);
                return {
                    id: noteId,
                    title: note ? note.title : 'Unknown Note'
                };
            });
        }));

        res.json({ paths: enrichedPaths });
    } catch (error) {
        res.status(500).json({ message: 'Error finding path between notes', error: error.message });
    }
};
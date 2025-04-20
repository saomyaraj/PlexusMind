// routes/graph.routes.js
//----------------------------------------------------
const express = require('express');
const router = express.Router();
const graphController = require('../controllers/graph.controller');

// Get complete graph data for visualization
router.get('/data', graphController.getGraphData);

// Get graph analysis and clusters
router.get('/analyze', graphController.analyzeGraph);

// Get closely related notes with similarity above threshold
router.get('/related/:noteId', graphController.getCloselyRelatedNotes);

// Find paths between two notes in the graph
router.get('/path/:sourceId/:targetId', graphController.findPathBetweenNotes);

module.exports = router;
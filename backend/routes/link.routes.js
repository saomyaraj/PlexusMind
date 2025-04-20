// routes/link.routes.js
//----------------------------------------------------
const express = require('express');
const router = express.Router();
const linkController = require('../controllers/link.controller');

// Create a manual link between notes
router.post('/manual', linkController.createManualLink);

// Get all links for a note
router.get('/note/:noteId', linkController.getLinksForNote);

// Update link metadata
router.put('/:linkId', linkController.updateLink);

// Delete a link
router.delete('/:linkId', linkController.deleteLink);

// Get strongest links in the system
router.get('/strongest', linkController.getStrongestLinks);

module.exports = router;
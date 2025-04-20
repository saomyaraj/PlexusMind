// services/nlp.service.js
//----------------------------------------------------
const axios = require('axios');
const config = require('../config/db');

const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://localhost:5000';

class NLPService {
    async processText(text) {
        try {
            const response = await axios.post(`${NLP_SERVICE_URL}/process`, { text });
            return response.data;
        } catch (error) {
            console.error('Error processing text with NLP service:', error);
            throw new Error('Failed to process text with NLP service');
        }
    }

    async findRelationships(text1, text2) {
        try {
            const response = await axios.post(`${NLP_SERVICE_URL}/relationships`, {
                text1,
                text2
            });
            return response.data;
        } catch (error) {
            console.error('Error finding relationships:', error);
            throw new Error('Failed to find relationships between texts');
        }
    }

    async clusterNotes(texts) {
        try {
            const response = await axios.post(`${NLP_SERVICE_URL}/cluster`, {
                texts
            });
            return response.data;
        } catch (error) {
            console.error('Error clustering notes:', error);
            throw new Error('Failed to cluster notes');
        }
    }

    async suggestRelatedNotes(noteId, text) {
        try {
            const response = await axios.post(`${NLP_SERVICE_URL}/suggest`, {
                noteId,
                text
            });
            return response.data;
        } catch (error) {
            console.error('Error suggesting related notes:', error);
            throw new Error('Failed to suggest related notes');
        }
    }
}

module.exports = new NLPService();
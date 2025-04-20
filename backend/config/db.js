// config/db.js
//----------------------------------------------------
const mongoose = require('mongoose');

const connectDB = async () => {
    const maxRetries = 5;
    const retryDelay = 5000; // 5 seconds
    let currentTry = 1;

    while (currentTry <= maxRetries) {
        try {
            console.log(`Attempting to connect to MongoDB (attempt ${currentTry}/${maxRetries})...`);
            const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/PlexusMind', {
                serverSelectionTimeoutMS: 5000,
                heartbeatFrequencyMS: 2000,
            });

            // Enable debug mode in development
            if (process.env.NODE_ENV === 'development') {
                mongoose.set('debug', true);
            }

            console.log(`MongoDB Connected: ${conn.connection.host}`);

            // Create text indexes for full-text search
            const collections = ['notes'];
            for (const collection of collections) {
                try {
                    await conn.connection.collection(collection).createIndex(
                        { title: 'text', content: 'text', tags: 'text' }
                    );
                } catch (error) {
                    console.warn(`Warning: Could not create text index for ${collection}:`, error);
                }
            }

            return conn;
        } catch (error) {
            console.error(`MongoDB connection attempt ${currentTry} failed:`, error.message);
            
            if (currentTry === maxRetries) {
                console.error('Max retries reached. Could not connect to MongoDB.');
                process.exit(1);
            }
            
            console.log(`Retrying in ${retryDelay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            currentTry++;
        }
    }
};

module.exports = connectDB;
// server.js (Main Entry Point)
//----------------------------------------------------
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db'); // Database connection function
const noteRoutes = require('./routes/note.routes');
const graphRoutes = require('./routes/graph.routes');
const linkRoutes = require('./routes/link.routes'); // Added for manual linking

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database Connection ---
connectDB();

// --- Middleware ---
// Enable Cross-Origin Resource Sharing
app.use(cors()); // Configure allowed origins properly in production!
// Parse JSON request bodies
app.use(express.json());
// Logging middleware
app.use(morgan('dev'));

// --- API Routes ---
app.use('/api/notes', noteRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/links', linkRoutes); // Register link routes

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api' });
});

// --- Global Error Handler (Basic Example) ---
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
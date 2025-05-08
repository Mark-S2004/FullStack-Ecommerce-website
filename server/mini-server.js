const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// Load environment variables
const envFile = `.env.development.local`;
console.log(`Loading environment variables from: ${envFile}`);
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Create Express app
const app = express();
const port = process.env.PORT || 3000;
const dbUri = process.env.DB_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the eCommerce API!' });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Health check endpoint for MongoDB
app.get('/api/health', async (req, res) => {
  try {
    const status = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    res.json({
      mongodb: {
        status: states[status] || 'unknown',
        readyState: status
      },
      server: 'running'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  try {
    // Set up Mongoose
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB successfully!');
    
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`API available at http://localhost:${port}/api/status`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle app termination
process.on('SIGINT', async () => {
  console.log('Shutting down server gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Run the server
startServer(); 
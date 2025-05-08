const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envFile = `.env.development.local`;
console.log(`Loading environment variables from: ${envFile}`);
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const app = express();
const port = process.env.PORT || 3000;
const dbUri = process.env.DB_URI;

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// API test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

async function startServer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB!');
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer(); 
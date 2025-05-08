import { config } from 'dotenv';
import * as path from 'path';
import { connect, disconnect } from 'mongoose';

// Load environment variables
const envFile = `.env.development.local`;
console.log(`Loading environment variables from: ${envFile}`);
config({ path: path.resolve(process.cwd(), envFile) });

const dbUri = process.env.DB_URI;
console.log('DB_URI:', dbUri);

async function testConnection() {
  try {
    if (!dbUri) {
      throw new Error('DB_URI environment variable is not defined');
    }
    
    console.log('Connecting to MongoDB...');
    await connect(dbUri);
    console.log('Successfully connected to MongoDB!');
    await disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

testConnection(); 
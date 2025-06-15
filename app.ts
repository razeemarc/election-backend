import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import the configured Express app from src/index.ts
import './src/index';

// This file now serves as the entry point for your application
// The actual Express configuration is in src/index.ts
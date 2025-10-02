import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Import routes
import uploadResumeRoute from './routes/uploadResume.js';
import interviewActionRoute from './routes/interviewAction.js';
import candidatesRoute from './routes/candidates.js';
import saveCandidateRoute from './routes/saveCandidate.js';

// Load environment variables
dotenv.config();

/**
 * Test Gemini API Connection
 */
async function testGeminiConnection() {
  console.log('\n🔍 Testing Gemini API Connection...');
  
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_ACTUAL_GEMINI_API_KEY_HERE') {
    console.error('❌ GEMINI_API_KEY not configured in .env');
    console.log('📝 Get your key from: https://makersuite.google.com/app/apikey\n');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
    
    const result = await model.generateContent('Say "Hello! API is working!" in one sentence.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API Connected!');
    console.log(`📨 Test Response: "${text.trim()}"`);
    console.log(`✓ Model: ${process.env.GEMINI_MODEL}\n`);
    return true;
  } catch (error) {
    console.error('❌ Gemini API Test Failed!');
    if (error.message.includes('API key not valid')) {
      console.error('   Invalid API key. Please check your GEMINI_API_KEY in .env');
    } else if (error.message.includes('model')) {
      console.error(`   Invalid model: ${process.env.GEMINI_MODEL}`);
      console.error('   Try: gemini-1.5-flash or gemini-1.5-pro');
    } else {
      console.error('   Error:', error.message);
    }
    console.log('');
    process.exit(1);
  }
}

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist (only for local development)
// Vercel serverless functions use /tmp directory
if (process.env.NODE_ENV !== 'production') {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

// Initialize MongoDB and routes
let isConnected = false;

async function connectDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
}

// API Routes
app.use('/api', uploadResumeRoute);
app.use('/api', interviewActionRoute);
app.use('/api', candidatesRoute);
app.use('/api', saveCandidateRoute);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await connectDatabase();
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      gemini: 'Connected',
      mongodb: 'Connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Swipe Interview Assistant API',
    endpoints: {
      health: '/api/health',
      uploadResume: '/api/upload-resume',
      interviewAction: '/api/interview-action',
      candidates: '/api/candidates',
      saveCandidate: '/api/save-candidate'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  async function startServer() {
    console.log('═'.repeat(60));
    console.log('  🚀 Starting Swipe Interview Assistant Server');
    console.log('═'.repeat(60));
    
    // Test Gemini API first
    await testGeminiConnection();
    
    // Connect to MongoDB
    await connectDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log('═'.repeat(60));
      console.log(`  ✅ Server is ready!`);
      console.log(`  🌐 URL: http://localhost:${PORT}`);
      console.log(`  📊 Health: http://localhost:${PORT}/api/health`);
      console.log('═'.repeat(60));
      console.log('');
    });
  }

  startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

// Export for Vercel serverless
export default async function handler(req, res) {
  // Connect to database on each request (serverless)
  await connectDatabase();
  
  // Handle the request with Express
  return app(req, res);
};

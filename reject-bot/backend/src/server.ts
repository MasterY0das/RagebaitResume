import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { analyzeResume } from './services/resumeAnalyzer';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import fs from 'fs';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Connect to MongoDB - but don't let it stop the server if it fails
try {
  connectDB().then(() => {
    console.log('MongoDB connected successfully');
  });
} catch (error) {
  console.error('MongoDB connection error - continuing without database:', error);
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Make uploads folder accessible
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);

// Routes
app.get('/', (req: Request, res: Response): void => {
  res.json({ message: 'RagebaitResume API is running' });
});

app.post('/api/analyze', upload.single('resume'), async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Analyze API Request ===');
    console.log('Headers:', req.headers);
    console.log('File details:', req.file);
    console.log('Body:', req.body);
    
    if (!req.file) {
      console.error('No file uploaded in the request');
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Check if API key is available
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      console.error('GROQ API key missing or not set properly');
      res.status(500).json({ 
        error: 'GROQ_API_KEY is missing or not set properly. Please check your .env file.',
        details: 'Get your API key from https://console.groq.com/ and add it to your .env file'
      });
      return;
    }

    console.log('Received request body:', req.body);
    console.log('Received file:', req.file ? req.file.filename : 'No file');

    // Get roast intensity from either 'intensity' or 'roastIntensity' parameter
    const roastIntensity = req.body.intensity || req.body.roastIntensity || 'medium';
    
    // Extract job context information
    const jobPosition = req.body.jobPosition || '';
    const jobField = req.body.jobField || '';
    
    try {
      const result = await analyzeResume(
        req.file.path, 
        roastIntensity as 'mild' | 'medium' | 'savage',
        { jobPosition, jobField }
      );
      
      // Ensure the result has the expected format
      if (!result.feedbackPoints || !Array.isArray(result.feedbackPoints)) {
        result.feedbackPoints = ["No specific feedback points were generated."];
      }
      
      if (!result.rejectionLetter) {
        result.rejectionLetter = "No rejection letter was generated.";
      }
      
      if (typeof result.score !== 'number') {
        result.score = 50; // Default score
      }
      
      res.json(result);
    } catch (analysisError) {
      console.error('Error in resume analysis:', analysisError);
      res.status(500).json({ 
        error: 'Failed to analyze resume', 
        details: analysisError instanceof Error ? analysisError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error processing resume:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: `Failed to analyze resume: ${error.message}` });
    } else {
      res.status(500).json({ error: 'Failed to analyze resume. Please try again.' });
    }
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  console.log(`Analyze endpoint available at http://localhost:${port}/api/analyze`);
  console.log('Make sure your frontend is configured to connect to this URL');
}); 
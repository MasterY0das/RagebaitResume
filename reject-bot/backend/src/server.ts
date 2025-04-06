import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { analyzeResume } from './services/resumeAnalyzer';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Make uploads folder accessible
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req: Request, res: Response): void => {
  res.json({ message: 'RagebaitResume API is running' });
});

app.post('/api/analyze', upload.single('resume'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Check if API key is available
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      res.status(500).json({ 
        error: 'GROQ_API_KEY is missing or not set properly. Please check your .env file.',
        details: 'Get your API key from https://console.groq.com/ and add it to your .env file'
      });
      return;
    }

    const roastIntensity = req.body.intensity || 'medium';
    
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
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
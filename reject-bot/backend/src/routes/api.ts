import express, { Request, Response } from 'express';
import multer from 'multer';
import { analyzeResume } from '../services/resumeAnalyzer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/analyze', upload.single('resume'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const intensity = req.body.intensity || 'medium';
    const result = await analyzeResume(req.file.path, intensity);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router };

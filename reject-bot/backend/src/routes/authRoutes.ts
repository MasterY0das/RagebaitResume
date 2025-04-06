import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  saveResume, 
  deleteResume 
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/save-resume', protect, saveResume);
router.delete('/resume/:resumeId', protect, deleteResume);

export default router; 
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT Token
const generateToken = (userId: string): string => {
  // Bypass TypeScript typechecking for this function call
  return (jwt.sign as any)({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
      return;
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      savedResumes: []
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login'
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - We'll add user to req in the auth middleware
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching user profile'
    });
  }
};

// Save resume to user profile
export const saveResume = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - We'll add user to req in the auth middleware
    const userId = req.user.id;
    const { 
      resumeId, 
      score, 
      letterGrade, 
      feedback, 
      rejectionLetter,
      jobPosition,
      jobField
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    // Add resume to savedResumes array
    user.savedResumes.push({
      resumeId,
      score,
      letterGrade,
      feedback,
      rejectionLetter,
      jobPosition,
      jobField,
      createdAt: new Date()
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume saved successfully',
      savedResumes: user.savedResumes
    });
  } catch (error) {
    console.error('Save resume error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error saving resume'
    });
  }
};

// Delete saved resume
export const deleteResume = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - We'll add user to req in the auth middleware
    const userId = req.user.id;
    const { resumeId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    // Filter out the resume to delete
    user.savedResumes = user.savedResumes.filter(
      (resume: any) => resume.resumeId.toString() !== resumeId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
      savedResumes: user.savedResumes
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting resume'
    });
  }
}; 
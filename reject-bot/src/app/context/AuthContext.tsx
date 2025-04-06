'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  savedResumes?: Array<{
    resumeId: string;
    score: number;
    letterGrade: string;
    feedback: string[];
    rejectionLetter: string;
    jobPosition?: string;
    jobField?: string;
    createdAt: Date;
  }>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  saveResume: (resumeData: any) => Promise<void>;
  deleteResume: (resumeId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on page load
  useEffect(() => {
    // Load token from localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      loadUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Load user data
  const loadUserData = async (authToken: string) => {
    try {
      setLoading(true);
      
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // Handle invalid token
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Register a new user
  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password
      });
      
      if (response.data.success) {
        // Save token and user data
        const { token: authToken, user: userData } = response.data;
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUser(userData);
        
        toast.success('Registration successful!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      if (response.data.success) {
        // Save token and user data
        const { token: authToken, user: userData } = response.data;
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUser(userData);
        
        toast.success('Login successful!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

  // Save resume to user profile
  const saveResume = async (resumeData: any) => {
    if (!token) {
      toast.error('You must be logged in to save resumes');
      return;
    }

    try {
      const response = await axios.post(
        '/api/auth/save-resume',
        resumeData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success && user) {
        // Create a proper copy with all required fields
        const updatedUser: User = {
          id: user.id,
          username: user.username,
          email: user.email,
          savedResumes: response.data.savedResumes
        };
        
        setUser(updatedUser);
        toast.success('Resume saved successfully!');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save resume. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Delete saved resume
  const deleteResume = async (resumeId: string) => {
    if (!token) {
      toast.error('You must be logged in to delete saved resumes');
      return;
    }

    try {
      const response = await axios.delete(`/api/auth/delete-resume?resumeId=${resumeId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success && user) {
        // Create a proper copy with all required fields
        const updatedUser: User = {
          id: user.id,
          username: user.username,
          email: user.email,
          savedResumes: response.data.savedResumes
        };
        
        setUser(updatedUser);
        toast.success('Resume deleted successfully!');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete resume. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Compute isAuthenticated
  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    saveResume,
    deleteResume
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
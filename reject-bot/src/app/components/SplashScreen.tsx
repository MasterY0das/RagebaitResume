'use client';

import React, { useEffect, useState } from 'react';
import { Logo } from './ui/Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [allowScroll, setAllowScroll] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setAllowScroll(true);
    }, 3000);

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (3000 / 150));
        return next > 100 ? 100 : next;
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Add a manual continue button instead of relying on scroll
  const handleContinue = () => {
    if (allowScroll) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 flex flex-col items-center justify-center z-50 min-h-screen">
      <div className="flex flex-col items-center justify-center flex-1 w-full px-8 text-center">
        {/* Logo container with padding for descenders */}
        <div className="mb-16 animate-fadeIn w-full max-w-2xl mx-auto px-4 py-8">
          <Logo size="xl" color="gradient" className="drop-shadow-xl" />
        </div>
        
        <div className="w-full max-w-md h-3 bg-gray-200 rounded-full mb-12 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {loading ? (
          <p className="text-gray-600 animate-pulse text-xl">Preparing your experience...</p>
        ) : (
          <div className="flex flex-col items-center animate-fadeIn">
            <p className="text-gray-800 text-2xl font-medium mb-8">Your resume is about to get real</p>
            
            <button 
              onClick={handleContinue}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 duration-200 text-lg"
            >
              Let's Begin
            </button>
            
            <p className="text-blue-600 mt-6">Get ready for honest feedback</p>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-6 text-sm text-gray-500">
        v1.0.0
      </div>
    </div>
  );
};

export default SplashScreen; 
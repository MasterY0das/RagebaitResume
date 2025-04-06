'use client';

import { useState, useEffect } from 'react';
import { ResumeUploader } from './components/ResumeUploader';
import { RoastSettings } from './components/RoastSettings';
import { RoastResult } from './components/RoastResult';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Toaster, toast } from 'react-hot-toast';
import { JobContextForm } from './components/JobContextForm';
import SplashScreen from './components/SplashScreen';
import { Header } from './components/ui/Header';
import { supabase } from '../utils/supabase';
import { saveResumeAnalysis } from '../utils/supabaseService';
import Link from 'next/link';

// Define the application states
type AppState = 'splash' | 'landing' | 'upload' | 'context' | 'settings' | 'loading' | 'result';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [file, setFile] = useState<File | null>(null);
  const [roastIntensity, setRoastIntensity] = useState<'mild' | 'medium' | 'savage'>('medium');
  const [roastResult, setRoastResult] = useState<any>(null);
  const [jobPosition, setJobPosition] = useState<string>('');
  const [jobField, setJobField] = useState<string>('');
  const [splashComplete, setSplashComplete] = useState(false);

  // Remove the localStorage check
  useEffect(() => {
    // Always set the app state to splash on startup
    setAppState('splash');
  }, []);

  const handleSplashComplete = () => {
    setSplashComplete(true);
    // Don't save to localStorage anymore
    setAppState('landing');
  };

  const handleUpload = (file: File) => {
    setFile(file);
    setAppState('context');
  };

  const handleJobContext = (position: string, field: string) => {
    setJobPosition(position);
    setJobField(field);
    setAppState('settings');
  };

  const handleSkipContext = () => {
    setJobPosition('');
    setJobField('');
    setAppState('settings');
  };

  const handleAnalyze = async (intensity: 'mild' | 'medium' | 'savage') => {
    setRoastIntensity(intensity);
    setAppState('loading');

    try {
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', file as Blob);
      formData.append('roastIntensity', intensity);
      
      // Add job context if provided
      if (jobPosition) {
        formData.append('jobPosition', jobPosition);
      }
      
      if (jobField) {
        formData.append('jobField', jobField);
      }

      // Send the request to the backend
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze resume');
      }

      // Validate response format
      if (!result.rejectionLetter || !Array.isArray(result.feedbackPoints) || typeof result.score !== 'number') {
        console.error('Invalid response format:', result);
        throw new Error('Received invalid response format from server');
      }

      setRoastResult(result);
      setAppState('result');
      
      // Check if user is logged in and save result to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          await saveResumeAnalysis({
            user_id: session.user.id,
            resume_name: file?.name || 'Unnamed Resume',
            job_position: jobPosition,
            job_field: jobField,
            intensity: intensity,
            rejection_letter: result.rejectionLetter,
            feedback_points: result.feedbackPoints,
            score: result.score
          });
          console.log('Resume analysis saved to Supabase');
        } catch (error) {
          console.error('Error saving to Supabase:', error);
          // Don't interrupt user flow for saving error
        }
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze resume. Please try again.');
      setAppState('settings');
    }
  };

  const handleTryAgain = () => {
    setFile(null);
    setRoastResult(null);
    setJobPosition('');
    setJobField('');
    setAppState('upload');
  };

  // Render splash screen if not completed
  if (appState === 'splash' && !splashComplete) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <>
      <Header onHome={() => setAppState('landing')} />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
        <Toaster position="top-center" />
        
        <div className="max-w-4xl mx-auto">
          {appState === 'landing' && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-fadeIn pt-6">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-blue-600 animate-fadeInScale">RagebaitResume</h1>
                <p className="text-xl text-gray-600 max-w-2xl animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                  Get professional feedback on your resume with a touch of humor. 
                  Upload your resume and receive detailed insights to help you stand out.
                </p>
              </div>
              
              <div className="relative w-full max-w-md h-60 my-8 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                <div className="absolute inset-0 bg-blue-100 rounded-lg transform rotate-3 shadow-md"></div>
                <div className="absolute inset-0 bg-blue-50 rounded-lg transform -rotate-2 shadow-md"></div>
                <div className="absolute inset-0 bg-white rounded-lg shadow-lg flex items-center justify-center p-6">
                  <div className="space-y-2 w-full">
                    <div className="h-6 bg-blue-100 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-10 bg-blue-500 rounded-lg w-1/2 mx-auto mt-6"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
                <button 
                  onClick={() => setAppState('upload')}
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 duration-200 text-xl mt-4"
                >
                  Get Started
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full animate-fadeIn" style={{ animationDelay: '0.9s' }}>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl text-blue-500 mb-3">1.</div>
                  <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
                  <p className="text-gray-600">Simply drag and drop or select your resume file to begin.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl text-blue-500 mb-3">2.</div>
                  <h3 className="text-lg font-semibold mb-2">Add Job Context</h3>
                  <p className="text-gray-600">Specify the position and field you're targeting for more relevant feedback.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl text-blue-500 mb-3">3.</div>
                  <h3 className="text-lg font-semibold mb-2">Get Detailed Insights</h3>
                  <p className="text-gray-600">Receive professional feedback tailored to your career goals.</p>
                </div>
              </div>
            </div>
          )}
          
          {appState === 'upload' && (
            <div className="mt-8 animate-fadeIn">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Upload Your Resume</h1>
                <p className="text-gray-600">Let's review your resume and provide helpful feedback</p>
              </div>
              <ResumeUploader onUpload={handleUpload} />
            </div>
          )}

          {appState === 'context' && (
            <div className="mt-8 animate-fadeIn">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Customize Your Feedback</h1>
                <p className="text-gray-600">Tell us more about the position you're applying for</p>
              </div>
              <JobContextForm 
                onSubmit={handleJobContext} 
                onSkip={handleSkipContext} 
              />
            </div>
          )}
          
          {appState === 'settings' && (
            <div className="mt-8 animate-fadeIn">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Choose Your Feedback Style</h1>
                <p className="text-gray-600">Select how you'd like to receive your resume feedback</p>
              </div>
              <RoastSettings onAnalyze={handleAnalyze} />
              
              {/* Show user their selected job context if provided */}
              {(jobPosition || jobField) && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium text-blue-800 mb-2">Your Job Context:</p>
                  <div className="flex flex-wrap gap-2">
                    {jobPosition && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Position: {jobPosition}
                      </span>
                    )}
                    {jobField && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Field: {jobField}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {appState === 'loading' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
              <LoadingSpinner size="large" />
              <div className="mt-8 text-center">
                <h2 className="text-2xl font-semibold text-blue-600 mb-2">Analyzing Your Resume</h2>
                <p className="text-gray-600">Our AI is carefully reviewing your resume for insights...</p>
                {(jobPosition || jobField) && (
                  <p className="text-blue-600 mt-2">
                    Tailoring feedback for {jobPosition && `"${jobPosition}" position`} 
                    {jobPosition && jobField && ' in '} 
                    {jobField && `the ${jobField} field`}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {appState === 'result' && roastResult && (
            <div className="mt-8 animate-fadeIn">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Your Resume Analysis</h1>
                <p className="text-gray-600">Review our feedback and suggestions for improvement</p>
                {(jobPosition || jobField) && (
                  <div className="mt-2 flex justify-center gap-2">
                    {jobPosition && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Position: {jobPosition}
                      </span>
                    )}
                    {jobField && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Field: {jobField}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="mt-4">
                  <button 
                    onClick={handleTryAgain} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Analyze Another Resume
                  </button>
                </div>
              </div>
              
              <RoastResult roast={roastResult} onTryAgain={handleTryAgain} />
            </div>
          )}
        </div>
        
        <footer className="mt-16 text-center text-gray-500 text-sm pb-4">
          <p>© {new Date().getFullYear()} RagebaitResume. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}

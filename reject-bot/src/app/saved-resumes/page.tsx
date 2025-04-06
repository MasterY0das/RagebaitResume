'use client';

import { useState, useEffect } from 'react';
import { Header } from '../components/ui/Header';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getUserResumeAnalyses, deleteResumeAnalysis } from '../../utils/supabaseService';
import { supabase } from '../../utils/supabase';
import { ResumeAnalysis } from '../../utils/supabase';
import Link from 'next/link';

export default function SavedResumes() {
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserAndAnalyses() {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('You must be logged in to view saved resumes');
          setLoading(false);
          return;
        }
        
        setUserId(session.user.id);
        
        // Fetch user's resume analyses
        const analysesData = await getUserResumeAnalyses(session.user.id);
        setAnalyses(analysesData);
      } catch (err) {
        console.error('Error fetching analyses:', err);
        setError('Failed to load saved resumes. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserAndAnalyses();
  }, []);
  
  const handleDelete = async (id: string) => {
    try {
      await deleteResumeAnalysis(id);
      // Update the analyses list after deletion
      setAnalyses(analyses.filter(analysis => analysis.id !== id));
    } catch (err) {
      console.error('Error deleting analysis:', err);
      setError('Failed to delete resume analysis. Please try again.');
    }
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Get intensity color
  const getIntensityColor = (intensity: string) => {
    switch(intensity) {
      case 'mild': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'savage': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div>
        <Header onHome={() => window.location.href = '/'} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <Header onHome={() => window.location.href = '/'} />
        <div className="max-w-4xl mx-auto mt-8 p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p>{error}</p>
            {error.includes('logged in') && (
              <Link href="/login" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header onHome={() => window.location.href = '/'} />
      <main className="max-w-4xl mx-auto mt-8 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Saved Resume Analyses</h1>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Analyze New Resume
          </Link>
        </div>
        
        {analyses.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">You don't have any saved resume analyses yet.</p>
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Analyze Your First Resume
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">{analysis.resume_name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm ${getIntensityColor(analysis.intensity)}`}>
                    {analysis.intensity.charAt(0).toUpperCase() + analysis.intensity.slice(1)}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <span className="font-medium">Score:</span>
                    <div className="flex items-center gap-1">
                      <span className={`font-bold ${analysis.score >= 70 ? 'text-green-600' : analysis.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {analysis.score}/100
                      </span>
                    </div>
                  </div>
                  
                  {(analysis.job_position || analysis.job_field) && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {analysis.job_position && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Position: {analysis.job_position}
                        </span>
                      )}
                      {analysis.job_field && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Field: {analysis.job_field}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600">
                    {analysis.created_at && formatDate(analysis.created_at)}
                  </p>
                </div>
                
                <div className="mb-3">
                  <h3 className="font-medium text-gray-700 mb-1">Rejection Letter:</h3>
                  <p className="text-gray-600 text-sm italic border-l-2 border-gray-300 pl-3">
                    {analysis.rejection_letter.substring(0, 150)}
                    {analysis.rejection_letter.length > 150 ? '...' : ''}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <Link
                    href={`/resume/${analysis.id}`}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                  
                  <button
                    onClick={() => handleDelete(analysis.id as string)}
                    className="px-3 py-1.5 bg-white border border-red-600 text-red-600 text-sm rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 
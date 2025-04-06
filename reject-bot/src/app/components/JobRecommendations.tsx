import React, { useState } from 'react';

// Removed fallback recommendations since they're now handled in the API

interface JobRecommendationsProps {
  resumeData: {
    rejectionLetter: string;
    feedbackPoints: string[];
    constructiveFeedback?: string[];
    score: number;
    letterGrade: string;
    roastIntensity: 'mild' | 'medium' | 'savage';
    jobPosition?: string;
    jobField?: string;
    text?: string;
  };
  jobPosition?: string;
  jobField?: string;
  onClose: () => void;
}

interface JobRecommendation {
  title: string;
  company: string;
  description: string;
  matchScore: number;
  skills: string[];
  whyMatch: string;
}

const JobRecommendations: React.FC<JobRecommendationsProps> = ({
  resumeData,
  jobPosition,
  jobField,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Add a timestamp to prevent caching issues
      const response = await fetch(`/api/job-recommendations?t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData,
          jobPosition,
          jobField
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get job recommendations: ${response.status}`);
      }

      const data = await response.json();
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations.slice(0, 2)); // Ensure we only display 2
        setShowResults(true);
        
        // If using fallback recommendations, show a warning
        if (data.source === 'fallback') {
          console.warn('Using fallback recommendations:', data.note);
          setError(`Note: Using pre-defined job matches. ${data.note || ''}`);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching job recommendations:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate job recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700">
          {!showResults ? 'Find Jobs That Match Your Resume' : 'Your Job Recommendations'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!showResults ? (
        <div className="space-y-6">
          <p className="text-gray-600 mb-4">
            We'll analyze your resume and find the top two job positions that match your skills and experience.
          </p>
          
          <div className="pt-4">
            <button 
              onClick={fetchRecommendations} 
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded font-medium text-white ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Finding matches...' : 'Find Job Matches'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl text-gray-600">No recommendations found. Please try again.</p>
              <button onClick={() => setShowResults(false)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  Based on your resume, we've found the following job matches that could be a good fit for your skills and experience.
                </p>
              </div>
              
              <div className="space-y-6">
                {recommendations.map((job, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                        <p className="text-blue-600">{job.company}</p>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {job.matchScore}% Match
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-3">{job.description}</p>
                    
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Skills Match:</div>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, i) => (
                          <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm font-medium text-gray-700 mb-2">Why this is a good match:</div>
                      <p className="text-gray-600 text-sm">{job.whyMatch}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between pt-4">
                <button onClick={() => setShowResults(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                  Back
                </button>
                <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/Button';
import { toast } from 'react-hot-toast';
import InterviewModal from './InterviewModal';
import JobRecommendations from './JobRecommendations';

interface RoastResultProps {
  roast: {
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
  onTryAgain: () => void;
}

export const RoastResult = ({ roast, onTryAgain }: RoastResultProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'constructive'>('summary');
  const [animateScore, setAnimateScore] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isJobRecsModalOpen, setIsJobRecsModalOpen] = useState(false);

  // Start animation after component mounts
  useEffect(() => {
    setTimeout(() => {
      setAnimateScore(true);
    }, 500);
  }, []);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await navigator.clipboard.writeText(roast.rejectionLetter);
      toast.success('Feedback copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast.error('Failed to copy feedback');
    }
    setIsSharing(false);
  };

  const handleOpenInterview = () => {
    setIsInterviewModalOpen(true);
  };

  const handleCloseInterview = () => {
    setIsInterviewModalOpen(false);
  };

  const handleOpenJobRecommendations = () => {
    setIsJobRecsModalOpen(true);
  };

  const handleCloseJobRecommendations = () => {
    setIsJobRecsModalOpen(false);
  };

  const displayScore = animateScore ? roast.score : 0;

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 75) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 75) return '🌟';
    if (score >= 50) return '👍';
    return '💪';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 75) return 'Excellent Resume';
    if (score >= 50) return 'Good Resume';
    return 'Needs Improvement';
  };

  // Format the rejection letter as a proper letter
  const formatLetter = (letter: string) => {
    // Don't add greeting or signature as it's now handled on the backend
    return letter;
  };

  // Clean up feedback points to remove duplicates and empty points
  const cleanFeedbackPoints = (points: string[]) => {
    if (!points || points.length === 0) return [];
    
    // Remove duplicates and empty points
    const uniquePoints = [...new Set(points.filter(point => point.trim() !== ''))];
    
    // Clean up each point
    return uniquePoints
      .map(point => {
        return point
          .replace(/^\d+[\.\)]\s*/, '') // Remove leading numbers like "1." or "1)"
          .replace(/^\[\w+.*?\]\s*/i, '') // Remove instruction markers like "[First point]"
          .replace(/\s*🎯|💡|⭐|🔍|💪\s*$/g, '') // Remove trailing emojis 
          .replace(/^\s*🎯|💡|⭐|🔍|💪\s*/g, '') // Remove leading emojis
          .trim();
      })
      .filter(point => 
        point.length > 0 && 
        !point.includes("Vedant Palsaniya's Resume Review") &&
        !point.includes("Summary of Qualifications:") &&
        !point.includes("Work & Volunteer Experience:") &&
        !point.includes("Co-Curricular Involvements:") &&
        !point.includes("Boy Scouts of America:") &&
        !point.includes("National High School Honor Society:") &&
        !point.includes("Python Classes & Circuitry Club:") &&
        !point.includes("Education:") &&
        !point.includes("Awards & Achievements:") &&
        !point.includes("Overall Feedback:")
      )
      .slice(0, 5); // Limit to 5 points for clarity
  };

  // Clean up constructive feedback points
  const cleanConstructiveFeedback = (points: string[]) => {
    if (!points || points.length === 0) return [];
    
    // Remove duplicates and empty points
    const uniquePoints = [...new Set(points.filter(point => point.trim() !== ''))];
    
    // Clean up each point
    return uniquePoints
      .map(point => {
        return point
          .replace(/^\d+[\.\)]\s*/, '') // Remove leading numbers like "1." or "1)"
          .replace(/^\-\s*/, '') // Remove leading hyphens
          .replace(/^\*\s*/, '') // Remove leading asterisks
          .replace(/^\[\w+.*?\]\s*/i, '') // Remove instruction markers like "[Improvement]"
          .replace(/\s*🎯|💡|⭐|🔍|💪\s*$/g, '') // Remove trailing emojis 
          .replace(/^\s*🎯|💡|⭐|🔍|💪\s*/g, '') // Remove leading emojis
          .replace(/^IMPROVEMENT:?\s*/i, '') // Remove "IMPROVEMENT:" prefix
          .replace(/^SUGGESTION:?\s*/i, '') // Remove "SUGGESTION:" prefix
          .replace(/^TIP:?\s*/i, '') // Remove "TIP:" prefix
          .replace(/^ADVICE:?\s*/i, '') // Remove "ADVICE:" prefix
          .replace(/^RECOMMENDED:?\s*/i, '') // Remove "RECOMMENDED:" prefix
          .replace(/(^\d+\.\s*)/g, '') // Another attempt to remove numbered lists
          .trim();
      })
      .filter(point => 
        point.length > 0 && 
        !point.includes("Improvements:") &&
        !point.includes("Suggestions:") &&
        !point.includes("Recommendations:") &&
        !point.includes("Here are some improvements") &&
        !point.includes("Here are suggestions") &&
        !point.match(/^\d+\./)  // Remove points that still start with numbers
      )
      .slice(0, 5); // Limit to 5 points for clarity
  };

  const cleanedFeedbackPoints = cleanFeedbackPoints(roast.feedbackPoints);
  const cleanedConstructiveFeedback = cleanConstructiveFeedback(roast.constructiveFeedback || []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Score Card */}
      <div className={`rounded-xl shadow-lg p-6 text-center border ${getScoreBackground(roast.score)}`}>
        <div className="text-2xl font-medium text-gray-700 mb-3">Your Resume Score</div>
        <div className="flex justify-center items-center space-x-4">
          <div className="relative w-32 h-32">
            {/* Circle background */}
            <svg className="w-32 h-32" viewBox="0 0 36 36">
              <path 
                className="stroke-current text-gray-200"
                fill="none"
                strokeWidth="3"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path 
                className={`stroke-current ${getScoreColor(roast.score)}`}
                fill="none"
                strokeWidth="3"
                strokeDasharray={`${displayScore}, 100`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1.5s ease-in-out' }}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-3xl font-bold ${getScoreColor(roast.score)}`} style={{ transition: 'all 1.5s ease-in-out' }}>
                {Math.round(displayScore)}
              </span>
              <span className="text-gray-500 text-sm">/100</span>
            </div>
          </div>
          
          <div className="text-left space-y-2">
            <div className="text-3xl mb-1">{getScoreEmoji(roast.score)}</div>
            <p className={`font-semibold text-lg ${getScoreColor(roast.score)}`}>{getScoreMessage(roast.score)}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-gray-600">Letter Grade:</span>
              <div className="flex flex-col">
                <span className={`text-2xl font-bold ${getScoreColor(roast.score)}`}>
                  {roast.letterGrade ? roast.letterGrade.substring(0, 2).trim() : 'C'}
                </span>
                {roast.letterGrade && roast.letterGrade.length > 2 && (
                  <span className="text-sm italic text-gray-600 max-w-48">
                    {roast.letterGrade.substring(2).trim()}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Based on content, format, and relevance</p>
          </div>
        </div>
      </div>

      {/* Feedback Card with Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button 
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'summary' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button 
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'detailed' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('detailed')}
          >
            Key Points
          </button>
          <button 
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'constructive' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('constructive')}
          >
            Improvements
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'summary' && (
            <div className="animate-fadeIn space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Feedback Summary</h3>
              <div className="p-4 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap font-serif border border-gray-100 shadow-inner">
                {formatLetter(roast.rejectionLetter)}
              </div>
            </div>
          )}
          
          {activeTab === 'detailed' && (
            <div className="animate-fadeIn space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Key Observations</h3>
              {cleanedFeedbackPoints.length > 0 ? (
                <ul className="space-y-3">
                  {cleanedFeedbackPoints.map((point, index) => {
                    // Assign different emojis for each feedback point
                    const emojis = ['💬', '🔍', '⚡', '✨', '🧠'];
                    const emoji = emojis[index % emojis.length];
                    
                    return (
                      <li key={index} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="mr-3 text-xl opacity-75">{emoji}</span>
                        <span className="text-gray-800">{point}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-600 italic">No specific points provided.</p>
              )}
            </div>
          )}
          
          {activeTab === 'constructive' && (
            <div className="animate-fadeIn space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Suggested Improvements</h3>
              {cleanedConstructiveFeedback.length > 0 ? (
                <ul className="space-y-3">
                  {cleanedConstructiveFeedback.map((point, index) => {
                    // Assign different emojis for each constructive point
                    const emojis = ['💡', '🚀', '📈', '🔧', '📝'];
                    const emoji = emojis[index % emojis.length];
                    
                    return (
                      <li key={index} className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="mr-3 text-xl text-blue-600">{emoji}</span>
                        <span className="text-gray-800">{point}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="space-y-3">
                  <li className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="mr-3 text-xl text-blue-600">💡</span>
                    <span className="text-gray-800">Be specific about achievements with quantifiable results.</span>
                  </li>
                  <li className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="mr-3 text-xl text-blue-600">🚀</span>
                    <span className="text-gray-800">Tailor your resume for each job application to highlight relevant skills.</span>
                  </li>
                  <li className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="mr-3 text-xl text-blue-600">📈</span>
                    <span className="text-gray-800">Use a clean, professional format with consistent styling throughout.</span>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center p-6 bg-gray-50 border-t border-gray-100">
          <Button 
            onClick={handleShare} 
            variant="secondary"
            size="lg"
            className="min-w-32"
          >
            {isSharing ? 'Copied!' : 'Copy Feedback'}
          </Button>
          <Button 
            onClick={handleOpenInterview}
            variant="primary" 
            size="lg"
            className="min-w-32 bg-purple-600 hover:bg-purple-700"
          >
            Take Interview
          </Button>
          <Button 
            onClick={handleOpenJobRecommendations}
            variant="primary" 
            size="lg"
            className="min-w-32 bg-blue-600 hover:bg-blue-700"
          >
            Find Job Matches
          </Button>
          <Button 
            onClick={onTryAgain}
            size="lg"
            className="min-w-32"
          >
            Try Another Resume
          </Button>
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Pro Tips</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span className="text-blue-900">Keep your resume to one page unless you have extensive relevant experience.</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span className="text-blue-900">Use action verbs at the beginning of bullet points to highlight your accomplishments.</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span className="text-blue-900">Proofread carefully - typos and grammatical errors can cost you an interview.</span>
          </li>
        </ul>
      </div>

      {isInterviewModalOpen && (
        <InterviewModal
          isOpen={isInterviewModalOpen}
          onClose={handleCloseInterview}
          resumeData={roast}
          jobPosition={roast.jobPosition}
          jobField={roast.jobField}
        />
      )}
      
      {isJobRecsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <JobRecommendations
            resumeData={roast}
            jobPosition={roast.jobPosition}
            jobField={roast.jobField}
            onClose={handleCloseJobRecommendations}
          />
        </div>
      )}
    </div>
  );
};

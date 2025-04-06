import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface InterviewFormProps {
  onResumeAnalyzed: (result: any) => void;
}

export const InterviewForm = ({ onResumeAnalyzed }: InterviewFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [roastIntensity, setRoastIntensity] = useState<'mild' | 'medium' | 'savage'>('medium');
  const [jobPosition, setJobPosition] = useState<string>('');
  const [jobField, setJobField] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please upload a resume');
      return;
    }
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roastIntensity', roastIntensity);
    
    // Add job position and field to the form data
    if (jobPosition) formData.append('jobPosition', jobPosition);
    if (jobField) formData.append('jobField', jobField);
    
    try {
      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Add job position and field to the result object
      result.jobPosition = jobPosition;
      result.jobField = jobField;
      
      // Ensure we store the raw resume text for job recommendation purposes
      if (!result.text && file) {
        // If text wasn't included in the response, try to extract it from the file
        try {
          const text = await readFileAsText(file);
          result.text = text;
        } catch (readError) {
          console.error('Error reading file text:', readError);
        }
      }
      
      onResumeAnalyzed(result);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze resume');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to read file contents as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-6">
      {/* ... existing file upload UI ... */}
      
      {/* Roast intensity selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Feedback Intensity
        </label>
        {/* ... existing roast intensity options ... */}
      </div>
      
      {/* Job Position Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Position You're Applying For (Optional)
        </label>
        <input
          type="text"
          value={jobPosition}
          onChange={(e) => setJobPosition(e.target.value)}
          placeholder="e.g. Software Engineer, Marketing Manager"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="text-xs text-gray-500">
          Enter the specific job title to get more targeted feedback and interview questions
        </p>
      </div>
      
      {/* Job Field/Industry */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Industry/Field (Optional)
        </label>
        <input
          type="text"
          value={jobField}
          onChange={(e) => setJobField(e.target.value)}
          placeholder="e.g. Technology, Healthcare, Finance"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="text-xs text-gray-500">
          Specify the industry for more relevant resume feedback and interview practice
        </p>
      </div>
      
      {/* Submit button */}
      <button
        type="submit"
        disabled={!file || isUploading}
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
          ${!file || isUploading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
      >
        {isUploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing Resume...
          </>
        ) : (
          'Roast My Resume'
        )}
      </button>
    </form>
  );
}; 
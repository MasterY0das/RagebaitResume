'use client';

import { useState } from 'react';
import { Button } from './ui/Button';

interface JobContextFormProps {
  onSubmit: (jobPosition: string, jobField: string) => void;
  onSkip: () => void;
}

export const JobContextForm = ({ onSubmit, onSkip }: JobContextFormProps) => {
  const [jobPosition, setJobPosition] = useState('');
  const [jobField, setJobField] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(jobPosition, jobField);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-center mb-4">
          Add Job Context (Optional)
        </h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Providing this information will help us tailor the feedback to your specific job needs
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="jobPosition" className="block text-sm font-medium text-gray-700 mb-1">
              Position You're Applying For
            </label>
            <input
              type="text"
              id="jobPosition"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Software Engineer, Project Manager, etc."
              value={jobPosition}
              onChange={(e) => setJobPosition(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="jobField" className="block text-sm font-medium text-gray-700 mb-1">
              Industry or Field
            </label>
            <input
              type="text"
              id="jobField"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Technology, Healthcare, Finance, etc."
              value={jobField}
              onChange={(e) => setJobField(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onSkip}
            >
              Skip (Generic Feedback)
            </Button>
            <Button
              type="submit"
              disabled={!jobPosition && !jobField}
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-2">💡 Why add job context?</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Get feedback relevant to your target position</li>
          <li>Highlight industry-specific requirements</li>
          <li>Receive more focused improvement suggestions</li>
        </ul>
      </div>
    </div>
  );
}; 
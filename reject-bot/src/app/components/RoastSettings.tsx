'use client';

import { useState } from 'react';
import { Button } from './ui/Button';

export type RoastIntensity = 'mild' | 'medium' | 'savage';

interface RoastSettingsProps {
  onAnalyze: (intensity: RoastIntensity) => void;
}

interface IntensityOption {
  id: RoastIntensity;
  title: string;
  description: string;
  color: string;
}

export const RoastSettings = ({ onAnalyze }: RoastSettingsProps) => {
  const [selectedIntensity, setSelectedIntensity] = useState<RoastIntensity>('medium');

  const intensityConfig: IntensityOption[] = [
    {
      id: 'mild',
      title: 'Gentle',
      description: 'Friendly feedback focusing on basics with light humor',
      color: 'border-green-500 bg-green-50',
    },
    {
      id: 'medium',
      title: 'Challenging',
      description: 'Critical feedback with specific improvement points',
      color: 'border-blue-500 bg-blue-50',
    },
    {
      id: 'savage',
      title: 'Direct',
      description: 'Brutally honest critique with detailed analysis',
      color: 'border-red-500 bg-red-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Choose Feedback Style</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {intensityConfig.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedIntensity(option.id)}
              className={`p-5 rounded-lg border-2 ${
                selectedIntensity === option.id
                  ? `${option.color} border-opacity-100 ring-2 ring-opacity-50 ring-offset-2 ${option.id === 'mild' ? 'ring-green-300' : option.id === 'medium' ? 'ring-blue-300' : 'ring-red-300'}`
                  : 'border-gray-200 bg-white border-opacity-50 hover:border-opacity-100 hover:bg-gray-50'
              } transition-all duration-200 text-left`}
            >
              <div className="space-y-2">
                <h3 className="font-bold text-lg">
                  {option.title}
                  {selectedIntensity === option.id && (
                    <span className="ml-2 text-xs py-1 px-2 rounded bg-gray-800 text-white">Selected</span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => onAnalyze(selectedIntensity)}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          Analyze My Resume
        </Button>
      </div>
    </div>
  );
};

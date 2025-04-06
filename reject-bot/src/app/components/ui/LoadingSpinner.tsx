'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'large';
  text?: string;
  color?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  text, 
  color = 'text-blue-600' 
}: LoadingSpinnerProps) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6';
      case 'md': return 'w-10 h-10';
      case 'lg': case 'large': return 'w-16 h-16';
      default: return 'w-10 h-10';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${getSize()} ${color} inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`} role="status">
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
      {text && (
        <p className="mt-4 text-center text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
}; 
'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'white' | 'blue' | 'gradient';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  color = 'blue',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  const colorClasses = {
    white: 'text-white',
    blue: 'text-blue-600',
    gradient: 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700'
  };

  return (
    <div className={`font-bold flex items-center justify-center ${sizeClasses[size]} ${colorClasses[color]} ${className} tracking-tight py-4`}>
      <div className="inline-block text-center">
        <span className="font-extrabold leading-relaxed">Ragebait</span>
        <span className="font-light">Resume</span>
      </div>
    </div>
  );
}; 
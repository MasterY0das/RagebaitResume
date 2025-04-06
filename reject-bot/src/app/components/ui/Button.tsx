// src/app/components/ui/Button.tsx
'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props 
}: ButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:bg-blue-800 focus:ring-blue-500';
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 hover:border-gray-400 active:bg-gray-300 focus:ring-gray-400';
      case 'outline':
        return 'bg-transparent hover:bg-gray-100 text-blue-600 border border-blue-600 hover:border-blue-700 active:bg-blue-50 focus:ring-blue-500';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg active:bg-red-800 focus:ring-red-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg active:bg-green-800 focus:ring-green-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:bg-blue-800 focus:ring-blue-500';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-3 py-1.5 rounded-md';
      case 'md':
        return 'text-sm px-4 py-2 rounded-md';
      case 'lg':
        return 'text-base px-5 py-2.5 rounded-lg';
      case 'xl':
        return 'text-lg px-6 py-3 rounded-lg';
      default:
        return 'text-sm px-4 py-2 rounded-md';
    }
  };

  return (
    <button
      className={`
        relative inline-flex items-center justify-center
        font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed
        transform hover:scale-[1.02] active:scale-[0.98]
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      
      <span className={`inline-flex items-center ${isLoading ? 'invisible' : ''}`}>
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </span>
    </button>
  );
};
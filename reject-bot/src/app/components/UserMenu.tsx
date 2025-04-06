'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function UserMenu() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
          G
        </div>
        <span className="hidden sm:inline-block font-medium">Guest User</span>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium">Guest User</p>
            <p className="text-xs text-gray-500">guest@example.com</p>
          </div>
          <Link 
            href="/" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Home
          </Link>
          <Link 
            href="/ragebait-resume" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            RagebaitResume
          </Link>
        </div>
      )}
    </div>
  );
} 
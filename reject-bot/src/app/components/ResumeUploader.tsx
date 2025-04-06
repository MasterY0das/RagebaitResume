'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Button } from './ui/Button';
import { toast } from 'react-hot-toast';

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
}

export const ResumeUploader = ({ onUpload }: ResumeUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file?: File) => {
    if (!file) return;

    // Check file type (.pdf, .doc, .docx, .txt)
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadClick = () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    onUpload(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    
    if (selectedFile.type === 'application/pdf') {
      return 'pdf';
    } else if (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
      return 'doc';
    } else {
      return 'txt';
    }
  };

  const fileIcon = getFileIcon();

  return (
    <div className="max-w-xl mx-auto">
      <div 
        className={`
          border-2 border-dashed rounded-lg p-8 
          transition-all duration-300 ease-in-out text-center shadow-sm
          ${dragActive ? 'border-blue-500 bg-blue-50 shadow-md scale-102' : 'border-gray-300 hover:border-blue-400 hover:shadow'} 
          ${selectedFile ? 'bg-blue-50 border-blue-300' : ''}
        `}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
        />

        {selectedFile ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 shadow-inner">
                {fileIcon === 'pdf' && (
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                )}
                {fileIcon === 'doc' && (
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {fileIcon === 'txt' && (
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-blue-700 text-lg">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready to analyze
                </p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button
                variant="secondary"
                onClick={triggerFileInput}
                size="md"
                className="px-6"
              >
                Change File
              </Button>
              <Button
                onClick={handleUploadClick}
                size="md"
                className="px-8"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 animate-pulse-custom">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-800 text-lg mb-2">
                Drag and drop your resume here
              </p>
              <p className="text-gray-600 mb-6">
                Supports PDF, DOC, DOCX, and TXT files (max 5MB)
              </p>
              <Button 
                onClick={triggerFileInput}
                size="lg"
                className="px-8"
              >
                Browse Files
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-blue-600 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M6.625 2.655A9 9 0 0119 11a1 1 0 11-2 0 7 7 0 00-9.625-6.492 1 1 0 11-.75-1.853zM4.662 4.959A1 1 0 014.75 6.37 6.97 6.97 0 003 11a1 1 0 11-2 0 8.97 8.97 0 012.25-5.953 1 1 0 011.412-.088z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M5 11a5 5 0 1110 0 1 1 0 11-2 0 3 3 0 10-6 0c0 1.677-.345 3.276-.968 4.729a1 1 0 11-1.838-.789A9.964 9.964 0 005 11z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">Your resume is analyzed securely and privately</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-blue-600 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">Get detailed feedback on format, content and style</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-blue-600 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">Actionable suggestions to improve your resume</p>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated, loading, deleteResume } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isAuthenticated && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleDeleteResume = async (resumeId: string) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      try {
        await deleteResume(resumeId);
      } catch (error) {
        console.error('Error deleting resume:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // We'll redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <Link
                href="/"
                className="text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md text-sm"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="text-lg font-medium">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Saved Resumes */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Saved Resumes ({user?.savedResumes?.length || 0})
            </h2>

            {user?.savedResumes && user.savedResumes.length > 0 ? (
              <div className="space-y-4">
                {user.savedResumes.map((resume, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-800">
                            Score: {resume.score}/100
                          </span>
                          <span className="ml-3 text-lg font-bold text-blue-700">
                            Grade: {resume.letterGrade}
                          </span>
                        </div>
                        {resume.jobPosition && (
                          <p className="text-sm text-gray-600">
                            Position: {resume.jobPosition}
                            {resume.jobField ? ` | Field: ${resume.jobField}` : ''}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Saved on: {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteResume(resume.resumeId)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Feedback:</h3>
                      <ul className="list-disc list-inside text-sm text-gray-600 ml-2 space-y-1">
                        {resume.feedback.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <h3 className="font-medium text-gray-700 mb-1">Rejection Letter:</h3>
                      <div className="text-sm text-gray-600 whitespace-pre-line">
                        {resume.rejectionLetter}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't saved any resumes yet.</p>
                <Link
                  href="/"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Upload a Resume
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
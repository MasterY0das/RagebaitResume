'use client';

import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { useRouter } from 'next/navigation';
import { Header } from '../components/ui/Header';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Attempting to register with:', { email, password });
      
      // For development/testing - use this to create a user without email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Registration error details:', error);
        throw error;
      }
      
      console.log('Registration response:', data);
      setSuccess(true);
      
      // For development environments, you can auto-login the user
      if (process.env.NODE_ENV === 'development') {
        try {
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (!loginError) {
            // Auto redirect after successful login
            setTimeout(() => router.push('/saved-resumes'), 2000);
          }
        } catch (loginErr) {
          console.error('Auto-login failed:', loginErr);
        }
      }
    } catch (error) {
      console.error('Error registering:', error);
      let errorMessage = error instanceof Error ? error.message : 'Failed to register';
      
      // Enhance specific error messages
      if (errorMessage.includes('duplicate key')) {
        errorMessage = 'This email is already registered. Please try logging in instead.';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header onHome={() => router.push('/')} />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 mt-16">
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Create an Account</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              {error.includes('network') && (
                <div className="mt-2 text-sm">
                  <strong>Debugging tips:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Check that your Supabase URL and key are correct</li>
                    <li>Ensure you have internet connectivity</li>
                    <li>Check browser console for more details</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              <p className="mb-2 font-medium">Registration successful!</p>
              <p>Please check your email for a confirmation link to complete your registration.</p>
              <div className="mt-4">
                <Link 
                  href="/login"
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  Go to login page
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
} 
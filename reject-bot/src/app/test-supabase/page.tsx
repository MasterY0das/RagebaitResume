'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Header } from '../components/ui/Header';
import Link from 'next/link';

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        setLoading(true);
        
        // Log connection details
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        setDetails({
          url: supabaseUrl,
          isHttps: supabaseUrl?.startsWith('https://'),
          hasCreds: supabaseUrl?.includes('@'),
          timestamp: new Date().toISOString()
        });
        
        // Test public API (this should work with any Supabase project)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setStatus('Connection successful! ✅');
      } catch (err) {
        console.error('Connection test error:', err);
        setStatus('Connection failed! ❌');
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    testConnection();
  }, []);
  
  return (
    <>
      <Header onHome={() => window.location.href = '/'} />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 mt-16">
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Supabase Connection Test</h1>
          
          <div className={`p-4 rounded mb-4 ${
            status.includes('successful') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : status.includes('failed')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <p className="font-semibold">{status}</p>
            {loading && <p className="text-sm mt-2">Running tests...</p>}
            {error && <p className="text-sm mt-2 overflow-auto">{error}</p>}
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
            <h2 className="font-semibold mb-2">Connection Details:</h2>
            <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">{JSON.stringify(details, null, 2)}</pre>
          </div>
          
          <div className="text-center mt-8">
            <Link 
              href="/"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../utils/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface HeaderProps {
  onHome: () => void;
}

export const Header = ({ onHome }: HeaderProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  useEffect(() => {
    // Get the current user on component mount
    const getUser = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className={`${isLandingPage ? 'bg-transparent' : 'bg-white shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 cursor-pointer" onClick={onHome}>
            <h1 className="text-xl font-bold text-blue-600">RagebaitResume</h1>
          </div>
          <nav className="flex items-center space-x-4">
            {!isLandingPage && (
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Home
              </Link>
            )}
            
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/saved-resumes" className="text-gray-600 hover:text-blue-600">
                      My Analyses
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-gray-600 hover:text-blue-600 px-3 py-1"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className={`${isLandingPage ? 'bg-blue-600' : 'bg-blue-600'} text-white px-4 py-2 rounded-lg hover:bg-blue-700`}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}; 
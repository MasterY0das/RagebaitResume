'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthContainerProps {
  onAuthSuccess: () => void;
}

export default function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="flex justify-center items-center w-full">
      {showLogin ? (
        <LoginForm 
          onSuccess={onAuthSuccess} 
          onSignupClick={() => setShowLogin(false)} 
        />
      ) : (
        <SignupForm 
          onSuccess={onAuthSuccess} 
          onLoginClick={() => setShowLogin(true)} 
        />
      )}
    </div>
  );
} 
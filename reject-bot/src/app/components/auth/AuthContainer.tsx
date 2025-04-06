'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
// Import SignupForm with a different name to avoid conflicts
import CustomSignupForm from './SignupForm';

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
        <CustomSignupForm 
          onSuccess={onAuthSuccess} 
          onLoginClick={() => setShowLogin(true)} 
        />
      )}
    </div>
  );
} 
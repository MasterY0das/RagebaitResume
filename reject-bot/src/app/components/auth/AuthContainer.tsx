'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
// Use the new component instead
import SignUpComponent from './SignUpComponent';

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
        <SignUpComponent 
          onSuccess={onAuthSuccess} 
          onLoginClick={() => setShowLogin(true)} 
        />
      )}
    </div>
  );
} 
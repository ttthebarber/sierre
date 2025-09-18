"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from './supabase-auth-form';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialError?: string | null;
}

export function AuthModal({ isOpen, onClose, initialError }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset to signin mode when modal opens
      setMode('signin');
      // Trigger animation after a small delay
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible 
          ? 'bg-black/20 backdrop-blur-sm' 
          : 'bg-transparent backdrop-blur-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`relative transition-all duration-300 ease-out transform ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-2xl">
          <CardHeader className="text-center relative">
            <CardTitle className="text-2xl">
              {mode === 'signup' ? "Sign up to Sierre" : "Sign in to Sierre"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AuthForm mode={mode} onModeChange={setMode} initialError={initialError} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

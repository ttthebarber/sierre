"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from './supabase-auth-form';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialError?: string | null;
}

export function AuthModal({ isOpen, onClose, initialError }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (isOpen) {
      // Reset to signin mode when modal opens
      setMode('signin');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-50">
      <div className="relative">
        <Card className="w-full max-w-md mx-auto bg-white border border-gray-200">
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

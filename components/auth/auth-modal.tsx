"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from './supabase-auth-form';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
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
        <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 bg-white">
          <CardHeader className="text-center relative">
            <CardTitle className="text-2xl">
              {mode === 'signup' ? "Sign up to Sierre" : "Sign in to Sierre"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AuthForm mode={mode} onModeChange={setMode} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

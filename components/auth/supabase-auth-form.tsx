"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Mail, RefreshCw } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  initialError?: string | null;
}

export function AuthForm({ mode, onModeChange, initialError }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { signIn, signUp, resendConfirmation, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email for a confirmation link! If you don\'t see it, check your spam folder.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResendLoading(true);
    setError(null);

    try {
      const { error } = await resendConfirmation(email);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Confirmation email sent! Check your inbox and spam folder.');
      }
    } catch (err) {
      setError('Failed to resend confirmation email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Password reset email sent! Check your inbox and spam folder.');
        setShowForgotPassword(false);
      }
    } catch (err) {
      setError('Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === 'signup' ? 8 : undefined}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {mode === 'signup' && (
          <div className="text-xs text-gray-500">
            Password must be at least 8 characters long
          </div>
        )}
      </div>

      <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </Button>

      {/* Enhanced Action Buttons */}
      <div className="space-y-2">
        {mode === 'signin' && (
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForgotPassword(!showForgotPassword)}
              className="text-sm text-gray-600 hover:text-gray-900 hover:bg-transparent"
            >
              Forgot your password?
            </Button>
          </div>
        )}

        {mode === 'signup' && (
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendConfirmation}
              disabled={resendLoading}
              className="text-sm text-gray-600 hover:text-gray-900 hover:bg-transparent"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend confirmation email
                </>
              )}
            </Button>
          </div>
        )}

        {showForgotPassword && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="h-4 w-4" />
                We'll send a password reset link to: {email}
              </div>
              <Button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-gray-600 hover:text-gray-900"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
          className="text-sm text-gray-600 hover:text-gray-900 hover:bg-transparent"
        >
          {mode === 'signin' 
            ? "Don't have an account? Sign up" 
            : "Already have an account? Sign in"
          }
        </Button>
      </div>
    </form>
  );
}

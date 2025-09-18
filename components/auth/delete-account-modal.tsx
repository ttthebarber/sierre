"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function DeleteAccountModal({ isOpen, onClose, userEmail }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'confirm' | 'final'>('confirm');
  const [isVisible, setIsVisible] = useState(false);

  const { deleteAccount } = useAuth();

  const expectedText = 'DELETE';
  const isConfirmationValid = confirmText === expectedText;

  useEffect(() => {
    if (isOpen) {
      // Trigger animation after a small delay
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (step === 'confirm') {
      setStep('final');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await deleteAccount();
      
      if (error) {
        setError(error.message || 'Failed to delete account');
        setLoading(false);
        return;
      }

      // Account deleted successfully - redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStep('confirm');
      setConfirmText('');
      setError(null);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
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
        className={`bg-white rounded-lg max-w-md w-full p-6 shadow-2xl transition-all duration-300 ease-out transform ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              {step === 'confirm' ? 'Delete Account' : 'Final Confirmation'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {step === 'confirm' ? (
          <>
            <div className="mb-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-2">This action cannot be undone!</p>
                  <p className="mb-2">Deleting your account will permanently remove:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>All your connected Shopify stores</li>
                    <li>All order and product data</li>
                    <li>Your subscription information</li>
                    <li>Your profile and settings</li>
                    <li>Access to all features</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                To confirm account deletion, type <strong>DELETE</strong> in the box below:
              </p>

              <div className="space-y-2">
                <Label htmlFor="confirmText">Confirmation</Label>
                <Input
                  id="confirmText"
                  type="text"
                  placeholder="Type DELETE to confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className={confirmText && !isConfirmationValid ? 'border-red-300' : ''}
                />
                {confirmText && !isConfirmationValid && (
                  <p className="text-xs text-red-600">
                    Please type exactly "DELETE" to confirm
                  </p>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={!isConfirmationValid || loading}
                className="flex-1 bg-white text-red-600 hover:bg-red-700 hover:text-white border border-red-600"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue to Final Step
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-2">Last chance to reconsider!</p>
                  <p>You are about to permanently delete your account and all associated data.</p>
                  {userEmail && (
                    <p className="mt-2 text-xs">
                      Account: <strong>{userEmail}</strong>
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Click "Delete My Account" below to permanently remove your account and all data.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('confirm')}
                className="flex-1"
                disabled={loading}
              >
                Go Back
              </Button>
              <Button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-white text-red-600 hover:bg-red-700 hover:text-white border border-red-600"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete My Account
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

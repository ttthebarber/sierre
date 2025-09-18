"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  size = 'md'
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation after a small delay
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
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
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-2xl transition-all duration-300 ease-out transform ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        } ${className}`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        <div className={title || showCloseButton ? 'p-6' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Export a simpler version for full-screen modals
export function FullScreenModal({ 
  isOpen, 
  onClose, 
  children, 
  className = ''
}: Omit<ModalProps, 'size' | 'title' | 'showCloseButton'>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
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
        className={`relative w-full h-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl transition-all duration-300 ease-out transform overflow-hidden ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
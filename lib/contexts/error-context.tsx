"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ErrorInfo {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  details?: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number; // in milliseconds
}

interface ErrorContextType {
  errors: ErrorInfo[];
  showError: (message: string, type?: 'error' | 'warning' | 'info', details?: string, options?: { autoHide?: boolean; duration?: number }) => void;
  hideError: (id: string) => void;
  clearAllErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const hideError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const showError = useCallback((
    message: string, 
    type: 'error' | 'warning' | 'info' = 'error',
    details?: string,
    options?: { autoHide?: boolean; duration?: number }
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newError: ErrorInfo = {
      id,
      message,
      type,
      details,
      timestamp: new Date(),
      autoHide: options?.autoHide ?? (type === 'info'),
      duration: options?.duration ?? (type === 'info' ? 5000 : type === 'warning' ? 8000 : 0)
    };

    setErrors(prev => [...prev, newError]);

    // Auto-hide if specified
    if (newError.autoHide && newError.duration) {
      setTimeout(() => {
        setErrors(prev => prev.filter(error => error.id !== id));
      }, newError.duration);
    }
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const value: ErrorContextType = {
    errors,
    showError,
    hideError,
    clearAllErrors
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

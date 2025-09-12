"use client";

import React from 'react';
import { X, AlertCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useError, ErrorInfo } from '@/lib/contexts/error-context';

interface ErrorDisplayProps {
  className?: string;
}

export function ErrorDisplay({ className }: ErrorDisplayProps) {
  const { errors, hideError } = useError();

  if (errors.length === 0) return null;

  const getIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getTextColor = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn(
      "fixed bottom-4 left-4 z-50 space-y-2 max-w-sm",
      className
    )}>
      {errors.map((error) => (
        <div
          key={error.id}
          className={cn(
            "flex items-start space-x-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out",
            "animate-in slide-in-from-left-2 fade-in-0",
            getBorderColor(error.type)
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(error.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className={cn("text-sm font-medium", getTextColor(error.type))}>
                {error.message}
              </p>
              <div className="flex items-center space-x-2 ml-2">
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(error.timestamp)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                  onClick={() => hideError(error.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {error.details && (
              <p className={cn("text-xs mt-1 opacity-80", getTextColor(error.type))}>
                {error.details}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

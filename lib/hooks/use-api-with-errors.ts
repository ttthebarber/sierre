"use client";

import { useEffect } from 'react';
import { useError } from '@/lib/contexts/error-context';
import { enhancedApiClient } from '@/lib/api/enhanced-client';

// Hook to initialize the API client with error handling
export function useApiWithErrors() {
  const { showError } = useError();

  useEffect(() => {
    // Initialize the API client with the error handler
    enhancedApiClient.setErrorHandler(showError);
  }, [showError]);

  return enhancedApiClient;
}

// Safe version that doesn't require ErrorProvider (for server-side rendering)
export function useApiClientSafe() {
  return enhancedApiClient;
}

// Utility function to handle API errors manually (for cases where you want custom error handling)
export function useErrorHandler() {
  const { showError } = useError();
  
  const handleApiError = (error: any, customMessage?: string) => {
    if (customMessage) {
      showError(customMessage, 'error', error?.message);
    } else {
      const { categorizeError } = require('@/lib/utils/error-handler');
      const errorInfo = categorizeError(error);
      showError(
        errorInfo.message,
        errorInfo.type,
        errorInfo.details,
        {
          autoHide: errorInfo.autoHide,
          duration: errorInfo.duration
        }
      );
    }
  };

  return { handleApiError, showError };
}

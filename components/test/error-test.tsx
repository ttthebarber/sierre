"use client";

import { Button } from '@/components/ui/button';
import { useError } from '@/lib/contexts/error-context';
import { useApiWithErrors } from '@/lib/hooks/use-api-with-errors';

export function ErrorTest() {
  const { showError } = useError();
  const apiClient = useApiWithErrors();

  const testError = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        showError(
          "This is a test error message",
          'error',
          "This error demonstrates how errors are displayed to users"
        );
        break;
      case 'warning':
        showError(
          "This is a test warning message",
          'warning',
          "Warnings are shown for non-critical issues that users should be aware of"
        );
        break;
      case 'info':
        showError(
          "This is a test info message",
          'info',
          "Info messages provide helpful information to users"
        );
        break;
    }
  };

  const testApiError = async () => {
    try {
      // This will trigger a 404 error
      await apiClient.get('/non-existent-endpoint');
    } catch (error) {
      // Error is automatically handled by the API client
    }
  };

  const testNetworkError = async () => {
    try {
      // This will trigger a network error
      await apiClient.get('https://invalid-url-that-does-not-exist.com/api/test');
    } catch (error) {
      // Error is automatically handled by the API client
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold">Error System Test</h3>
      <p className="text-sm text-gray-600">
        Click the buttons below to test different types of error messages.
        Errors will appear in the bottom-left corner of the screen.
      </p>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => testError('error')}
        >
          Test Error
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => testError('warning')}
        >
          Test Warning
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => testError('info')}
        >
          Test Info
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={testApiError}
        >
          Test API Error
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={testNetworkError}
        >
          Test Network Error
        </Button>
      </div>
    </div>
  );
}

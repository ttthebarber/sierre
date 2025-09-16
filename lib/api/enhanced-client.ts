"use client";

import { categorizeError, extractErrorMessage } from '@/lib/utils/error-handler';

// Enhanced API client that integrates with the error system
class EnhancedApiClient {
  private baseUrl: string;
  private showError?: (message: string, type?: 'error' | 'warning' | 'info', details?: string, options?: { autoHide?: boolean; duration?: number }) => void;
  
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  // Method to set the error handler (called from components that have access to useError)
  setErrorHandler(showError: (message: string, type?: 'error' | 'warning' | 'info', details?: string, options?: { autoHide?: boolean; duration?: number }) => void) {
    this.showError = showError;
  }

  private handleError(error: any, showToUser = true) {
    console.error('API Request failed:', error);
    
    if (showToUser && this.showError) {
      const errorInfo = categorizeError(error);
      this.showError(
        errorInfo.message,
        errorInfo.type,
        errorInfo.details,
        {
          autoHide: errorInfo.autoHide,
          duration: errorInfo.duration
        }
      );
    }
    
    throw error;
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    showErrorToUser = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorDetails: string | undefined;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = errorData.details;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        const error = {
          status: response.status,
          message: errorMessage,
          details: errorDetails
        };
        
        this.handleError(error, showErrorToUser);
      }
      
      return await response.json();
    } catch (error) {
      this.handleError(error, showErrorToUser);
      throw error; // Re-throw the error after handling it
    }
  }
  
  get<T>(endpoint: string, showErrorToUser = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, showErrorToUser);
  }
  
  post<T>(endpoint: string, data?: any, showErrorToUser = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, showErrorToUser);
  }
  
  put<T>(endpoint: string, data?: any, showErrorToUser = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, showErrorToUser);
  }
  
  delete<T>(endpoint: string, showErrorToUser = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, showErrorToUser);
  }
}

export const enhancedApiClient = new EnhancedApiClient();

// Hook to initialize the API client with error handling
export function useApiClient() {
  return enhancedApiClient;
}

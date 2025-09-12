import { ErrorInfo } from '@/lib/contexts/error-context';

// User-friendly error messages for common scenarios
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection and try again.",
  TIMEOUT_ERROR: "The request is taking too long. Please try again in a moment.",
  
  // Authentication errors
  UNAUTHORIZED: "You need to sign in to access this feature.",
  FORBIDDEN: "You don't have permission to perform this action.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  
  // API errors
  API_ERROR: "Something went wrong on our end. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  NOT_FOUND: "The requested resource was not found.",
  
  // Shopify specific errors
  SHOPIFY_CONNECTION_FAILED: "Failed to connect to your Shopify store. Please check your store URL and try again.",
  SHOPIFY_INVALID_CREDENTIALS: "Invalid Shopify credentials. Please reconnect your store.",
  SHOPIFY_RATE_LIMITED: "Shopify is temporarily limiting requests. Please wait a moment and try again.",
  SHOPIFY_WEBHOOK_FAILED: "Failed to set up webhooks. Your store data may not sync automatically.",
  
  // Database errors
  DATABASE_ERROR: "Unable to save your data. Please try again.",
  DATA_SYNC_ERROR: "Failed to sync your store data. Please try again later.",
  
  // File upload errors
  FILE_TOO_LARGE: "The file is too large. Please choose a smaller file.",
  INVALID_FILE_TYPE: "Invalid file type. Please choose a supported file format.",
  UPLOAD_FAILED: "Failed to upload the file. Please try again.",
  
  // General errors
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again or contact support if the problem persists.",
  FEATURE_UNAVAILABLE: "This feature is currently unavailable. Please try again later.",
} as const;

// Error type categorization
export function categorizeError(error: any): {
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  autoHide?: boolean;
  duration?: number;
} {
  // Handle different error types
  if (error instanceof Error) {
    return categorizeErrorByMessage(error.message);
  }
  
  if (typeof error === 'string') {
    return categorizeErrorByMessage(error);
  }
  
  if (error?.response?.status) {
    return categorizeErrorByStatus(error.response.status, error.response.data?.message);
  }
  
  if (error?.status) {
    return categorizeErrorByStatus(error.status, error.message);
  }
  
  return {
    type: 'error',
    message: ERROR_MESSAGES.UNKNOWN_ERROR,
    details: error?.message || 'Unknown error occurred'
  };
}

function categorizeErrorByMessage(message: string): ReturnType<typeof categorizeError> {
  const lowerMessage = message.toLowerCase();
  
  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return {
      type: 'error',
      message: ERROR_MESSAGES.NETWORK_ERROR,
      details: message
    };
  }
  
  // Timeout errors
  if (lowerMessage.includes('timeout')) {
    return {
      type: 'warning',
      message: ERROR_MESSAGES.TIMEOUT_ERROR,
      details: message,
      autoHide: true,
      duration: 5000
    };
  }
  
  // Authentication errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('401')) {
    return {
      type: 'error',
      message: ERROR_MESSAGES.UNAUTHORIZED,
      details: message
    };
  }
  
  if (lowerMessage.includes('forbidden') || lowerMessage.includes('403')) {
    return {
      type: 'error',
      message: ERROR_MESSAGES.FORBIDDEN,
      details: message
    };
  }
  
  // Shopify specific errors
  if (lowerMessage.includes('shopify')) {
    if (lowerMessage.includes('connection') || lowerMessage.includes('connect')) {
      return {
        type: 'error',
        message: ERROR_MESSAGES.SHOPIFY_CONNECTION_FAILED,
        details: message
      };
    }
    
    if (lowerMessage.includes('credential') || lowerMessage.includes('token')) {
      return {
        type: 'error',
        message: ERROR_MESSAGES.SHOPIFY_INVALID_CREDENTIALS,
        details: message
      };
    }
    
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('429')) {
      return {
        type: 'warning',
        message: ERROR_MESSAGES.SHOPIFY_RATE_LIMITED,
        details: message,
        autoHide: true,
        duration: 8000
      };
    }
    
    if (lowerMessage.includes('webhook')) {
      return {
        type: 'warning',
        message: ERROR_MESSAGES.SHOPIFY_WEBHOOK_FAILED,
        details: message
      };
    }
  }
  
  // Validation errors
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return {
      type: 'warning',
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      details: message
    };
  }
  
  // Not found errors
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return {
      type: 'warning',
      message: ERROR_MESSAGES.NOT_FOUND,
      details: message
    };
  }
  
  // Default to generic error
  return {
    type: 'error',
    message: ERROR_MESSAGES.API_ERROR,
    details: message
  };
}

function categorizeErrorByStatus(status: number, message?: string): ReturnType<typeof categorizeError> {
  switch (status) {
    case 401:
      return {
        type: 'error',
        message: ERROR_MESSAGES.UNAUTHORIZED,
        details: message
      };
    
    case 403:
      return {
        type: 'error',
        message: ERROR_MESSAGES.FORBIDDEN,
        details: message
      };
    
    case 404:
      return {
        type: 'warning',
        message: ERROR_MESSAGES.NOT_FOUND,
        details: message
      };
    
    case 408:
      return {
        type: 'warning',
        message: ERROR_MESSAGES.TIMEOUT_ERROR,
        details: message,
        autoHide: true,
        duration: 5000
      };
    
    case 429:
      return {
        type: 'warning',
        message: ERROR_MESSAGES.SHOPIFY_RATE_LIMITED,
        details: message,
        autoHide: true,
        duration: 8000
      };
    
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: 'error',
        message: ERROR_MESSAGES.API_ERROR,
        details: message
      };
    
    default:
      return {
        type: 'error',
        message: ERROR_MESSAGES.API_ERROR,
        details: message || `HTTP ${status} error`
      };
  }
}

// Helper function to extract user-friendly error message from API responses
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

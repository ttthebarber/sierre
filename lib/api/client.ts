// Custom error class for API errors
class ApiError extends Error {
  status: number;
  response?: string;

  constructor(message: string, status: number, response?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

// Base API client with error handling and auth
class ApiClient {
    private baseUrl: string;
    
    constructor(baseUrl = '/api') {
      this.baseUrl = baseUrl;
    }
    
    async request<T>(
      endpoint: string, 
      options: RequestInit = {}
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
          throw new ApiError(
            `API Error: ${response.status}`,
            response.status,
            await response.text()
          );
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Request failed:', error);
        throw error;
      }
    }
    
    get<T>(endpoint: string): Promise<T> {
      return this.request<T>(endpoint, { method: 'GET' });
    }
    
    post<T>(endpoint: string, data?: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    }
    
    put<T>(endpoint: string, data?: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    }
    
    delete<T>(endpoint: string): Promise<T> {
      return this.request<T>(endpoint, { method: 'DELETE' });
    }
  }
  
  export const apiClient = new ApiClient();
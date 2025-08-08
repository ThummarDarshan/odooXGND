// Centralized API utility with timeout and error handling
const API_BASE_URL = 'http://localhost:5001/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest(
  endpoint: string,
  options: ApiOptions = {}
): Promise<any> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = REQUEST_TIMEOUT
  } = options;

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Add default headers
  headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    
    throw new ApiError(
      error.message || 'Network error',
      0
    );
  }
}

// Convenience methods
export const api = {
  get: (endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiRequest(endpoint, { ...options, method: 'POST', body }),
  
  put: (endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiRequest(endpoint, { ...options, method: 'PUT', body }),
  
  delete: (endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

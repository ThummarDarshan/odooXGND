import type { Stop } from "@/types/itinerary";

// Centralized API utility with timeout and error handling
const API_BASE_URL = 'http://localhost:5001/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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

  // Debug: Log request details
  console.log('API Request:', {
    url: `${API_BASE_URL}${endpoint}`,
    method,
    headers,
    body,
  });

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

    // Debug: Log response status and text
    console.log('API Response:', response.status, response.statusText);
    const text = await response.text();
    console.log('API Response Body:', text);
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw new ApiError(
      (typeof error === 'object' && error !== null && 'message' in error) ? (error as any).message : 'Network error',
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
  
  patch: (endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiRequest(endpoint, { ...options, method: 'PATCH', body }),
};

// API functions for itineraries

export async function saveItineraryDraft({
  user_id,
  title,
  description,
  start_date,
  end_date,
  stops,
  cost,
  information,
  itineraryId,
}: {
  user_id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  stops: Stop[];
  cost: number;
  information?: string;
  itineraryId: number;
}) {
  return api.patch(`/itineraries/${itineraryId}`, {
    cost,
    information,
  });
}

export async function createItinerary({
  user_id,
  title,
  description,
  start_date,
  end_date,
  stops,
  cost,
  information,
}: {
  user_id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  stops: Stop[];
  cost: number;
  information?: string;
}) {
  // Send the full stops array as destinations
  return api.post("/itineraries", {
    user_id,
    title,
    description,
    start_date,
    end_date,
    destinations: stops, // full stops array with start/end date for each stop
    activities: stops.map((s) => s.activities),
    cost,
    information,
  });
}

export async function fetchItinerary(itineraryId: number) {
  return api.get(`/itineraries/${itineraryId}`);
}

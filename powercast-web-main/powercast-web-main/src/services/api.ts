import { API_BASE_URL } from '@/utils/constants';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API Request Error: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    // In production, log to telemetry service
    return Promise.reject(error);
  }
}


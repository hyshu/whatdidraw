interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout. Please try again.', 408);
    }
    throw error;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function apiRequest<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { retries = 3, ...fetchOptions } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions);

      if (!response.ok) {
        let errorMessage = 'Request failed';
        let errorData: any = null;

        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Request failed with status ${response.status}`;
        }

        throw new ApiError(errorMessage, response.status, errorData);
      }

      try {
        const data = await response.json();
        return data as T;
      } catch (error) {
        throw new ApiError('Invalid response format', response.status);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (error instanceof ApiError && error.statusCode && error.statusCode < 500) {
        throw error;
      }

      if (attempt < retries - 1) {
        const backoffTime = Math.pow(2, attempt) * 1000;
        await sleep(backoffTime);
        continue;
      }
    }
  }

  throw lastError || new ApiError('Request failed after retries');
}

export async function get<T>(url: string, options?: FetchOptions): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

export async function post<T>(
  url: string,
  data: any,
  options?: FetchOptions
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(data),
  });
}

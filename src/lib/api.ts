export interface ApiError {
  error: string;
  [key: string]: any;
}

export async function apiRequest<T = any>(
  url: string,
  options: Omit<RequestInit, 'body'> & { body?: any } = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  const config: RequestInit = {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    
    let data: any;
    const isJson = contentType && contentType.includes('application/json');

    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // 1. Try to extract error message from JSON { error: "..." }
      if (isJson && data && typeof data === 'object' && 'error' in data) {
        throw new Error(data.error);
      }
      
      // 2. If it's a string (HTML or text), use it as error message (truncated)
      if (typeof data === 'string') {
        const errorMessage = data.length > 100 
          ? data.substring(0, 100) + '...' 
          : data;
        throw new Error(errorMessage || `Request failed with status ${response.status}`);
      }

      // 3. Fallback
      throw new Error(`Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Request Failed (${url}):`, error);
    throw error;
  }
}

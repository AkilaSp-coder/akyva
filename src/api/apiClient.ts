const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('akyva_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    if (res.status === 401) {
      // Unauthorized or token expired
      if (!endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/register')) {
        localStorage.removeItem('akyva_token');
        localStorage.removeItem('akyva_user');
        window.dispatchEvent(new CustomEvent('akyva_auth_expired'));
      }
    }

    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const message = data?.message || data?.error || 'Unable to complete request. Please try again.';
      throw new Error(message);
    }

    return data as T;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      throw new Error('Connection lost. Please check your network connection.');
    }
    throw err;
  }
}

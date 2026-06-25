import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

function handleUnauthorized(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

async function parseJsonBody<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(
      response.status,
      'Server returned an invalid response. Is the backend running?',
    );
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await parseJsonBody<{
      message?: string;
      detail?: string;
      error?: string;
      title?: string;
    }>(response)) ?? {};

    return (
      data.message ??
      data.detail ??
      data.error ??
      data.title ??
      response.statusText
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return error.message;
    }

    return response.statusText || 'Request failed';
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(0, 'Cannot connect to server. Is the backend running?');
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      handleUnauthorized();
    }

    const message = await parseErrorMessage(response);
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return parseJsonBody<T>(response);
}

export async function apiClientFormData<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = new Headers();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch {
    throw new ApiError(0, 'Cannot connect to server. Is the backend running?');
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      handleUnauthorized();
    }

    const message = await parseErrorMessage(response);
    throw new ApiError(response.status, message);
  }

  return parseJsonBody<T>(response);
}

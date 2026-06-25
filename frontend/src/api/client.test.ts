import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient, UNAUTHORIZED_EVENT } from './client';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../types/auth';

function mockFetchOnce(response: Partial<Response>): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response as Response));
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('apiClient 401 handling', () => {
  it('clears the session and emits an event on 401 when a token exists', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'token');
    localStorage.setItem(USER_STORAGE_KEY, '{"id":1,"username":"a"}');

    mockFetchOnce({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'Expired' }),
    });

    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);

    await expect(apiClient('/api/subscriptions')).rejects.toMatchObject({ status: 401 });

    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });

  it('does not emit an event on 401 when there is no token (failed login)', async () => {
    mockFetchOnce({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'Invalid credentials.' }),
    });

    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);

    await expect(
      apiClient('/api/login', { method: 'POST', body: '{}' }),
    ).rejects.toMatchObject({ status: 401 });

    expect(listener).not.toHaveBeenCalled();

    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });
});

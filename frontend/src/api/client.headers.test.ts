import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from './client';
import { TOKEN_STORAGE_KEY } from '../types/auth';

function mockFetch(impl: (url: string, init?: RequestInit) => Partial<Response>) {
  const spy = vi.fn((url: string, init?: RequestInit) => Promise.resolve(impl(url, init) as Response));
  vi.stubGlobal('fetch', spy);
  return spy;
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('apiClient', () => {
  it('adds the Authorization header when a token is present', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'abc');

    const spy = mockFetch(() => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true }),
    }));

    await apiClient('/api/subscriptions');

    const init = spy.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer abc');
  });

  it('throws ApiError with the backend message', async () => {
    mockFetch(() => ({
      ok: false,
      status: 422,
      text: async () => JSON.stringify({ message: 'Boom' }),
    }));

    await expect(apiClient('/api/subscriptions')).rejects.toMatchObject({
      status: 422,
      message: 'Boom',
    });
  });

  it('returns undefined for 204 without parsing JSON', async () => {
    mockFetch(() => ({ ok: true, status: 204, text: async () => '' }));

    const result = await apiClient('/api/subscriptions/1', { method: 'DELETE' });

    expect(result).toBeUndefined();
  });

  it('maps invalid JSON to an ApiError', async () => {
    mockFetch(() => ({
      ok: true,
      status: 200,
      text: async () => 'not-json',
    }));

    await expect(apiClient('/api/subscriptions')).rejects.toBeInstanceOf(ApiError);
  });

  it('maps a network failure to an ApiError with status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(apiClient('/api/subscriptions')).rejects.toMatchObject({ status: 0 });
  });
});

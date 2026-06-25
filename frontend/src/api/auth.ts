import type { AuthResponse, LoginInput } from '../types/auth';
import { apiClient } from './client';

export async function login(input: LoginInput): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify({
      username: input.username,
      password: input.password,
    }),
  });
}

export async function register(input: LoginInput): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      username: input.username,
      password: input.password,
    }),
  });
}

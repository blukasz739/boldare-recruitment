export interface User {
  id: number;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  username: string;
  password: string;
}

export const TOKEN_STORAGE_KEY = 'subtrack_token';
export const USER_STORAGE_KEY = 'subtrack_user';

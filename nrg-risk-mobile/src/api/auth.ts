import { apiRequest } from './client';

export type ApiUser = {
  id: number;
  username: string;
  email: string;
  role: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: ApiUser;
};

export function register(username: string, email: string, password: string) {
  return apiRequest<TokenResponse>('/auth/register', {
    method: 'POST',
    body: { username, email, password },
  });
}

export function login(email: string, password: string) {
  return apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function fetchMe(token: string) {
  return apiRequest<ApiUser>('/auth/me', { token });
}
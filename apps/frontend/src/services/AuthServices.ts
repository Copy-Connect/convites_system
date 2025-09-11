import { ApiClient } from './ApiClient';

const api = new ApiClient();

export const AuthService = {
  async login(email: string, password: string) {
    // backend: POST /auth/login -> { token, user }
    return api.post<{ token: string; user: { id: number; name: string; email: string } }>(
      '/auth/login',
      { email, password }
    );
  },
  async register(name: string, email: string, password: string) {
    return api.post('/auth/register', { name, email, password });
  },
};

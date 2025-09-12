// src/services/AuthService.ts
import { ApiClient } from './ApiClient'
const api = new ApiClient()

export const AuthService = {
  login(email: string, password: string) {
    return api.post<{ token: string; user: { id: string; name: string; email: string } }>('/auth/login', { email, password })
  },
  register(name: string, email: string, password: string) {
    return api.post('/auth/register', { name, email, password })
  },
}

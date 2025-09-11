import { defineStore } from 'pinia';
import { AuthService } from '@/services/AuthService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('jwt') || '',
    user: null as null | { id: number; name: string; email: string },
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
  },
  actions: {
    async login(email: string, password: string) {
      const { token, user } = await AuthService.login(email, password);
      this.token = token;
      this.user = user;
      localStorage.setItem('jwt', token);
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('jwt');
    },
  },
});

import { defineStore } from 'pinia';
import api, { setAuth } from '@/services/ApiClient';
export const useAuth = defineStore('auth', {
  state: () => ({ token: localStorage.getItem('token') || '', user: null as null | { id:number; email:string } }),
  actions: {
    async login(email:string,password:string){ const { data } = await api.login(email,password); this.token=data.accessToken; this.user=data.user; localStorage.setItem('token',this.token); setAuth(this.token); },
    async register(email:string,password:string){ const { data } = await api.register(email,password); this.token=data.accessToken; this.user=data.user; localStorage.setItem('token',this.token); setAuth(this.token); },
    logout(){ this.token=''; this.user=null; localStorage.removeItem('token'); setAuth(); }
  }
});

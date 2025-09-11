import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000' });
export function setAuth(token?: string) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}
export default {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (email: string, password: string) => api.post('/auth/register', { email, password }),
  createOrder: (data: { theme: string; name: string; age: number; address: string; mp3Path?: string }) => api.post('/orders', data),
  listOrders: () => api.get('/orders'),
  getOrder: (id: number) => api.get(`/orders/${id}`),
  createPix: (b: { referenceId: string; description: string; amount: number }) => api.post('/payments/pix', b),
  createCard: (b: { referenceId: string; description: string; amount: number; cardToken: string }) => api.post('/payments/card', b),
  generateInvite: (id: number) => api.post(`/orders/${id}/generate`, {}),
};

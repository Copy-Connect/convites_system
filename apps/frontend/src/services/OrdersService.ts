import { ApiClient } from './ApiClient';
import { Order } from '@/models/Order';

const api = new ApiClient();

export const OrdersService = {
  list() {
    return api.get<Order[]>('/orders');
  },
  create(input: Pick<Order, 'name' | 'age' | 'address' | 'themeSlug'>) {
    return api.post<Order>('/orders', input);
  },
  get(id: string) {
    return api.get<Order>(`/orders/${id}`);
  },
  generateInvite(id: string) {
    return api.post<{ path: string }>(`/orders/${id}/invite`);
  },
};

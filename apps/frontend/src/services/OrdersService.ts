import { ApiClient } from './ApiClient';
import { Order } from '@/models/Order';

const api = new ApiClient();

type OrdersQuery = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export const OrdersService = {
  list(params?: OrdersQuery) {
    return api.get<Order[]>('/orders', params);
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

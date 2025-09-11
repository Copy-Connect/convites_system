import { ApiClient } from './ApiClient';
import { Order } from '@/models/Order';

const api = new ApiClient();

export const OrdersService = {
  list() {
    return api.get<Order[]>('/orders');
  },
  create(input: Pick<Order, 'name' | 'age' | 'address' | 'themeSlug'>) {
    // backend: POST /orders -> { id, ... }
    return api.post<Order>('/orders', input);
  },
  get(id: number) {
    return api.get<Order>(`/orders/${id}`);
  },
};

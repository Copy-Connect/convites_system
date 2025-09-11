export class Order {
  id?: number;
  name = '';
  age?: number;
  address = '';
  themeSlug = '';
  status: 'pending' | 'paid' | 'canceled' | 'generated' = 'pending';
  createdAt?: string;

  constructor(init?: Partial<Order>) {
    Object.assign(this, init);
  }
}

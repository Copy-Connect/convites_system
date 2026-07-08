export type OrderGuest = {
  name: string;
  age: number;
};

export class Order {
  id?: string;
  name = '';
  age?: number;
  address = '';
  zipCode = '';
  street = '';
  addressNumber = '';
  neighborhood = '';
  city = '';
  stateCode = '';
  complement = '';
  referencePoint = '';
  giftIdeas = '';
  possibleGuests: OrderGuest[] = [];
  themeSlug = '';
  themeName?: string | null;
  slug?: string;
  amountCents?: number | null;
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | null;
  status: 'PENDING' | 'PAID' | 'CANCELED' | 'GENERATED' = 'PENDING';
  createdAt?: string;
  updatedAt?: string;

  constructor(init?: Partial<Order>) {
    Object.assign(this, init);
  }
}

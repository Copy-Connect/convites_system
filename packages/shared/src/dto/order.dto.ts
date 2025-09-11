export interface CreateOrderDTO {
  theme: string;
  name: string;
  age: number;
  address: string;
  mp3Path?: string | null;
}
export interface OrderDTO extends CreateOrderDTO {
  id: number;
  userId: number;
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

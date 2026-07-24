export interface CreateCheckoutInput {
  orderId: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  payerEmail?: string;
}

export interface CheckoutResult {
  preferenceId: string;
  checkoutUrl: string;
  sandboxCheckoutUrl?: string;
}

export interface MercadoPagoWebhookBody {
  id?: number;
  live_mode?: boolean;
  type?: string;
  action?: string;
  data?: {
    id?: string;
  };
}

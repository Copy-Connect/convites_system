import { ApiClient } from './ApiClient';

const api = new ApiClient();

export const PaymentsService = {
  createPix(orderId: string, amountCents = 1990) {
    return api.post<{
      id: string;
      status: string;
      transactionId?: string | null;
      qrCodeUrl?: string | null;
      checkoutUrl?: string | null;
    }>('/payments/checkout', {
      orderId,
      amountCents,
      method: 'PIX',
    });
  },
  getStatusByOrder(orderId: string) {
    return api.get<{ id: string; status: string; transactionId: string | null }>(
      '/payments/status',
      { order_id: orderId },
    );
  },
};

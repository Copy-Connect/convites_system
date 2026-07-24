// apps/frontend/src/services/PaymentsService.ts

import ApiClient from './ApiClient';

const apiClient = new ApiClient();

export interface CheckoutResponse {
  preferenceId: string;
  checkoutUrl: string;
  sandboxCheckoutUrl?: string;
}

export async function createCheckout(
  orderId: string,
): Promise<CheckoutResponse> {
  const response =
    await apiClient.post<CheckoutResponse>(
      `/payments/checkout/${orderId}`,
    );

  return response.data;
}



//   getStatusByOrder(orderId: string) {
//     return api.get<{ id: string; status: string; transactionId: string | null }>(
//       '/payments/status',
//       { order_id: orderId },
//     );
//   },
// };

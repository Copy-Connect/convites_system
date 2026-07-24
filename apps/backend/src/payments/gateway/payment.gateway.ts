import {
  CheckoutResult,
  CreateCheckoutInput,
} from '../types/payment.types';

export abstract class PaymentGateway {
  abstract createCheckout(
    input: CreateCheckoutInput,
  ): Promise<CheckoutResult>;

  abstract getPayment(paymentId: string): Promise<unknown>;
}

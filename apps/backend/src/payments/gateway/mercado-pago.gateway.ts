// apps/backend/src/payments/gateway/mercado-pago.gateway.ts

import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MercadoPagoConfig,
  Payment,
  Preference,
} from 'mercadopago';

import { PaymentGateway } from './payment.gateway';
import {
  CheckoutResult,
  CreateCheckoutInput,
} from '../types/payment.types';

@Injectable()
export class MercadoPagoGateway implements PaymentGateway {
  private readonly preferenceClient: Preference;
  private readonly paymentClient: Payment;

  constructor(private readonly configService: ConfigService) {
    const accessToken =
      this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error(
        'A variável MERCADO_PAGO_ACCESS_TOKEN não foi configurada',
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
      },
    });

    this.preferenceClient = new Preference(client);
    this.paymentClient = new Payment(client);
  }

  async createCheckout(
    input: CreateCheckoutInput,
  ): Promise<CheckoutResult> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const backendUrl = this.configService.get<string>('BACKEND_URL');

    if (!frontendUrl || !backendUrl) {
      throw new Error(
        'FRONTEND_URL e BACKEND_URL precisam estar configuradas',
      );
    }

    try {
      const preference = await this.preferenceClient.create({
        body: {
          items: [
            {
              id: input.orderId,
              title: input.title,
              description: input.description,
              quantity: input.quantity,
              currency_id: 'BRL',
              unit_price: input.unitPrice,
            },
          ],

          payer: input.payerEmail
            ? {
                email: input.payerEmail,
              }
            : undefined,

          external_reference: input.orderId,

          back_urls: {
            success: `${frontendUrl}/pagamento/retorno?status=success`,
            pending: `${frontendUrl}/pagamento/retorno?status=pending`,
            failure: `${frontendUrl}/pagamento/retorno?status=failure`,
          },

          auto_return: 'approved',

          notification_url: `${backendUrl}/payments/webhook`,

          metadata: {
            order_id: input.orderId,
          },
        },
      });

      if (!preference.id || !preference.init_point) {
        throw new Error(
          'O Mercado Pago não retornou a URL de checkout',
        );
      }

      return {
        preferenceId: preference.id,
        checkoutUrl: preference.init_point,
        sandboxCheckoutUrl:
          preference.sandbox_init_point ?? undefined,
      };
    } catch (error) {
      console.error(
        'Erro ao criar preference no Mercado Pago:',
        error,
      );

      throw new InternalServerErrorException(
        'Não foi possível iniciar o pagamento',
      );
    }
  }

  async getPayment(paymentId: string) {
    return this.paymentClient.get({
      id: paymentId,
    });
  }
}

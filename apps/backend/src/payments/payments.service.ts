// apps/backend/src/payments/payments.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrdersService } from '../orders/orders.service';
import { PaymentGateway } from './gateway/payment.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async createCheckout(
    orderId: string,
    authenticatedUserId: string,
  ) {
    /*
     * Adapte para o método que existe no seu OrdersService.
     * É importante consultar o valor no banco, em vez de aceitar
     * um valor enviado pelo frontend.
     */
    const order = await this.ordersService.findById(orderId);

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (order.userId !== authenticatedUserId) {
      throw new NotFoundException('Pedido não encontrado');
    }

    const checkout = await this.paymentGateway.createCheckout({
      orderId: order.id,
      title: `Convite digital - Pedido ${order.id}`,
      description: 'Criação de convite digital personalizado',
      quantity: 1,

      // Adapte para o campo monetário existente no seu model Order.
      unitPrice: Number(order.totalAmount),

      // Adapte de acordo com a relação User do Prisma.
      payerEmail: order.user?.email,
    });

    /*
     * Aqui você pode criar ou atualizar seu registro Payment:
     *
     * await this.prisma.payment.upsert({
     *   where: { orderId: order.id },
     *   update: {
     *     provider: 'MERCADO_PAGO',
     *     preferenceId: checkout.preferenceId,
     *     status: 'PENDING',
     *   },
     *   create: {
     *     orderId: order.id,
     *     provider: 'MERCADO_PAGO',
     *     preferenceId: checkout.preferenceId,
     *     status: 'PENDING',
     *   },
     * });
     */

    return checkout;
  }

  async processPaymentNotification(paymentId: string) {
    const payment: any = await this.paymentGateway.getPayment(paymentId);

    const orderId =
      payment.external_reference ??
      payment.metadata?.order_id;

    if (!orderId) {
      return;
    }

    /*
     * Adapte este método ao seu banco.
     *
     * O importante é atualizar usando os dados consultados diretamente
     * na API do Mercado Pago, e não confiar somente no body do webhook.
     */
    await this.ordersService.updatePaymentStatus(orderId, {
      providerPaymentId: String(payment.id),
      paymentStatus: payment.status,
      paymentStatusDetail: payment.status_detail,
      paidAmount: payment.transaction_amount,
      paymentMethod: payment.payment_method_id,
      paidAt: payment.date_approved
        ? new Date(payment.date_approved)
        : null,
    });
  }
}

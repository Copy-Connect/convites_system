// apps/backend/src/payments/payments.controller.ts

import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from 'mercadopago';

import { CurrentUser } from '../auth/current-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { MercadoPagoWebhookBody } from './types/payment.types';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout/:orderId')
  async createCheckout(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.paymentsService.createCheckout(
      orderId,
      user.id,
    );
  }

  @Post('webhook')
  @HttpCode(200)
  async receiveWebhook(
    @Headers('x-signature') xSignature: string | undefined,
    @Headers('x-request-id') xRequestId: string | undefined,
    @Query('data.id') queryDataId: string | undefined,
    @Body() body: MercadoPagoWebhookBody,
  ) {
    const secret =
      this.configService.get<string>(
        'MERCADO_PAGO_WEBHOOK_SECRET',
      );

    if (!secret) {
      throw new Error(
        'MERCADO_PAGO_WEBHOOK_SECRET não foi configurada',
      );
    }

    const dataId =
      queryDataId ??
      body.data?.id;

    if (
      !xSignature ||
      !xRequestId ||
      !dataId
    ) {
      throw new UnauthorizedException(
        'Notificação sem dados de assinatura',
      );
    }

    try {
      WebhookSignatureValidator.validate({
        xSignature,
        xRequestId,
        dataId,
        secret,
      });
    } catch (error) {
      if (
        error instanceof InvalidWebhookSignatureError
      ) {
        throw new UnauthorizedException(
          'Assinatura do webhook inválida',
        );
      }

      throw error;
    }

    if (body.type === 'payment') {
      await this.paymentsService
        .processPaymentNotification(dataId);
    }

    return {
      received: true,
    };
  }
}

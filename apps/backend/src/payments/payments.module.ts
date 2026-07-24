import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OrdersModule } from 'orders/orders.module';
import { MercadoPagoGateway } from './gateway/mercado-pago.gateway';

@Module({
    imports: [OrdersModule],
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        MercadoPagoGateway,
    ],
    exports: [PaymentsService, MercadoPagoGateway],
})
export class PaymentsModule {}

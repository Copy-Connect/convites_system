import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "health.controller";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        OrdersModule,
        PaymentsModule,
    ],

    controllers: [HealthController],
})
export class AppModule {}

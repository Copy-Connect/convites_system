// src/payments/dto/create-checkout.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;
}

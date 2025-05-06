import { OrderItem } from '@/interfaces/orders.interface';
import { IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  public customerId: string;

  public items: OrderItem[];
}

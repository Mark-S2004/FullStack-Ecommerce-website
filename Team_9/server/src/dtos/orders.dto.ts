import { IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  public address: string;
}

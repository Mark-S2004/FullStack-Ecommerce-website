import { IsNumber, IsString } from 'class-validator';

export class CreateCartItemDto {
  @IsString()
  public productId: string;

  @IsNumber()
  public quantity: number;
}

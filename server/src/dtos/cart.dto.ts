import { IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CartItemDto {
  @IsMongoId()
  @IsNotEmpty()
  public productId: string;

  @IsNumber()
  @Min(0) // Allow 0 for removal intent, though controller handles it explicitly
  @IsNotEmpty()
  public quantity: number;
}

import { IsArray, IsMongoId, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class CartItemDto {
  @IsMongoId()
  product: string;

  @IsNumber()
  qty: number;
}

export class UpdateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}

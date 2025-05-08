import { IsNumber, IsString } from 'class-validator';

export class CreateCartItemDto {
  @IsString()
  public productId: string;

  // Renamed from qty to quantity to match schema/frontend
  @IsNumber()
  public quantity: number;

  // Added size as it's used in frontend and backend logic
  @IsString()
  public size: string; // Assuming size is a required field for adding to cart
}
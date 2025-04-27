import { IsString, IsNumber, IsIn, IsArray, IsOptional, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class CreateProductDto {
  // The name of the product (required)
  @IsString()
  name: string;

  // A brief description of the product (optional)
  @IsString()
  @IsOptional()
  description?: string;

  // The price of the product (required)
  @IsNumber()
  price: number;

  // The category of the product (required, must be one of the specified values)
  @IsIn(['denim', 'quarter-zip'])
  category: string;

  // The gender for which the product is intended (required, must be one of the specified values)
  @IsIn(['male', 'female', 'unisex'])
  gender: string;

  // Available sizes for the product (optional, must be an array of unique strings)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  @IsOptional()
  sizes?: string[];

  // The URL of the product image (optional)
  @IsString()
  @IsOptional()
  imageUrl?: string;

  // The stock quantity of the product (optional)
  @IsNumber()
  @IsOptional()
  stock?: number;
}

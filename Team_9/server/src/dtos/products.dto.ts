import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  public name: string;

  @IsString()
  public description: string;

  @IsString()
  public category: string;

  @IsNumber()
  public price: number;

  @IsNumber()
  @IsOptional()
  public originalPrice?: number;

  @IsNumber()
  @IsOptional()
  public discountPercentage?: number;

  @IsNumber()
  public stock: number;

  @IsString()
  @IsOptional()
  public imageUrl?: string;
}

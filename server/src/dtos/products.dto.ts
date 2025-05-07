import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  public name: string;

  @IsString()
  public description: string;

  @IsNumber()
  public price: number;

  @IsNumber()
  public stock: number;

  @IsString()
  public category: string;

  @IsEnum(['Men', 'Women', 'Unisex'])
  public gender: 'Men' | 'Women' | 'Unisex';

  @IsArray()
  @IsOptional()
  public sizes?: string[];

  @IsArray()
  @IsOptional()
  public colors?: string[];

  @IsArray()
  @IsOptional()
  public images?: string[];
}

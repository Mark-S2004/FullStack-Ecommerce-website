import { IsNumber, IsString, IsNotEmpty, IsPositive, IsInt, Min, IsOptional, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsNumber()
  @IsPositive()
  public price: number;

  @IsInt()
  @Min(0)
  public stock: number;

  @IsOptional()
  @IsString()
  public category?: string;

  @IsOptional()
  @IsString()
  // Consider using @IsIn(['Men', 'Women', 'Unisex']) if you have fixed values
  public gender?: string;

  // images can be handled separately or as an array of strings if simple URLs
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public images?: string[];
}

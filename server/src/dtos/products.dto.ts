import { IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  public name: string;

  @IsString()
  public description: string;

  @IsNumber()
  public price: number;

  @IsNumber()
  public stock: number;
}

import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, Max, IsOptional, IsBoolean, IsDateString, IsArray, ArrayMinSize, IsMongoId } from 'class-validator';
import { DiscountType } from '@interfaces/discounts.interface';

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  public code: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  public discountType: DiscountType;

  @IsNumber()
  @Min(0)
  // For percentage, you might add @Max(100) if value is 0-100
  public value: number;

  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;

  @IsOptional()
  @IsDateString()
  public validFrom?: string; // ISO Date String

  @IsOptional()
  @IsDateString()
  public validTo?: string; // ISO Date String

  @IsOptional()
  @IsNumber()
  @Min(0)
  public minPurchase?: number; // In cents

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  public applicableProducts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public applicableCategories?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  public usageLimit?: number;
}

export class UpdateDiscountDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public code?: string;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsEnum(DiscountType)
  public discountType?: DiscountType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public value?: number;

  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;

  @IsOptional()
  @IsDateString()
  public validFrom?: string;

  @IsOptional()
  @IsDateString()
  public validTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public minPurchase?: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  public applicableProducts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public applicableCategories?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  public usageLimit?: number;
} 
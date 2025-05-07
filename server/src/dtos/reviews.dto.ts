// src/dtos/reviews.dto.ts

import { IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  public rating: number;

  @IsString()
  public comment: string;
}

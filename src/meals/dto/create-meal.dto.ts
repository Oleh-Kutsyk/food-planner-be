import { IsOptional, IsString } from 'class-validator';

export class CreateMealDto {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsString()
  body: string;
  @IsOptional()
  published: boolean;
}

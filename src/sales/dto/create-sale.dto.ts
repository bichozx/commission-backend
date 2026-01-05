import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSaleDto {
  @IsUUID()
  affiliateId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

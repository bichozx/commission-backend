import { IsEnum, IsOptional } from 'class-validator';

import { AffiliateLevel } from '../entities/affiliate.entity';
import { Type } from 'class-transformer';

export class GetAffiliatesDto {
  @IsOptional()
  @IsEnum(AffiliateLevel, {
    message: 'level must be one of the following values: 1, 2, 3, 4',
  })
  @Type(() => Number) // <--- convierte automáticamente a número
  level?: AffiliateLevel;
}

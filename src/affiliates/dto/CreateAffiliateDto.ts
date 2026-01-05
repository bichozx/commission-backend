import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAffiliateDto {
  @ApiProperty({ description: 'ID del usuario que será afiliado' })
  userId: string;

  @ApiPropertyOptional({ description: 'ID del afiliado padre (referido)' })
  parentId?: string;
}

export class UpdateAffiliateDto {
  @ApiPropertyOptional({ description: 'Nivel del afiliado (1-3)' })
  level?: number;

  @ApiPropertyOptional({ description: 'Comisión asignada al afiliado' })
  commissionRate?: number;

  @ApiPropertyOptional({
    description: 'Estado del afiliado',
    enum: ['active', 'inactive'],
  })
  status?: 'active' | 'inactive';
}

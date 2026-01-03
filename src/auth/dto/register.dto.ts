import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 8,
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  name: string;

  @ApiProperty({
    example: 'uuid-of-parent-affiliate',
    required: false,
    description: 'Parent affiliate ID for multi-level structure',
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsUUID()
  parentAffiliateId?: string;
}

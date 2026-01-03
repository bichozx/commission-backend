import { IsEmail, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  password: string;
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { RegisterAffiliateDto } from './dto/registerAffiliateDto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🔹 Registro público (sin padre)
  @Post('register')
  @ApiOperation({ summary: 'Register a new user and affiliate' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409 })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // 🔹 Login
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 🔹 Registro DELEGADO (nivel 1 o 2)
  @Post('register-affiliate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async registerAffiliate(@Req() req, @Body() dto: RegisterAffiliateDto) {
    return this.authService.registerAffiliate(dto, req.user.affiliateId);
  }
}

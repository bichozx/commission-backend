import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/entities/user.entity';
import {
  Affiliate,
  AffiliateLevel,
  AffiliateStatus,
} from '../affiliates/entities/affiliate.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterAffiliateDto } from './dto/registerAffiliateDto';
import { AffiliatesService } from '../affiliates/affiliates.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Affiliate)
    private readonly affiliateRepo: Repository<Affiliate>,

    private readonly jwtService: JwtService,
    private readonly affiliatesService: AffiliatesService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, parentAffiliateId } = registerDto;

    // Verificar si el email ya existe
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      name,
      role: UserRole.AFFILIATE,
    });

    const savedUser = await this.userRepo.save(user);

    // ✅ CORRECCIÓN: Asignar nivel y commission rate basado en la jerarquía
    let level = 1; // Por defecto nivel 1
    let commissionRate = 0; // Por defecto 0 (no recibe comisiones)
    let parentId: string | null = null;

    if (parentAffiliateId) {
      const parentAffiliate = await this.affiliateRepo.findOne({
        where: { id: parentAffiliateId },
      });

      if (parentAffiliate) {
        parentId = parentAffiliate.id;
        level = parentAffiliate.level + 1; // El nivel es +1 del padre

        // ✅ CORRECCIÓN: Asignar commissionRate basado en el nivel
        // Si es nivel 2, 3 o 4 (seller) - el seller NO recibe comisión
        // Solo niveles 1, 2, 3 reciben comisiones
        if (level <= 3) {
          // Nivel 1: 10%, Nivel 2: 5%, Nivel 3: 2.5%
          const commissionRates = { 1: 10, 2: 5, 3: 2.5 };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          commissionRate = commissionRates[level] || 0;
        }
        // Nivel 4 (seller) se queda en 0 - no recibe comisiones
      }
    } else {
      // Si no tiene parent, es nivel 1 y recibe 10%
      level = 1;
      commissionRate = 10;
    }

    // Crear afiliado
    const affiliate = this.affiliateRepo.create({
      userId: savedUser.id,
      level,
      parentId,
      commissionRate,
      status: AffiliateStatus.ACTIVE,
    });

    const savedAffiliate = await this.affiliateRepo.save(affiliate);

    // Generar token
    const token = this.generateToken(savedUser, savedAffiliate);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
      },
      affiliate: {
        id: savedAffiliate.id,
        level: savedAffiliate.level,
        commissionRate: savedAffiliate.commissionRate,
      },
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const affiliate = await this.affiliateRepo.findOne({
      where: { userId: user.id },
    });

    const token = this.generateToken(user, affiliate || undefined);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      affiliate: affiliate
        ? {
            id: affiliate.id,
            level: affiliate.level,
            commissionRate: affiliate.commissionRate,
          }
        : null,
      access_token: token,
    };
  }

  private generateToken(user: User, affiliate?: Affiliate): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      affiliateId: affiliate?.id || null,
    };

    return this.jwtService.sign(payload);
  }

  async registerAffiliate(
    dto: RegisterAffiliateDto,
    parentAffiliateId: string,
  ) {
    const parent = await this.affiliatesService.findById(parentAffiliateId);

    if (!parent) {
      throw new NotFoundException('Parent affiliate not found');
    }

    if (parent.level >= AffiliateLevel.LEVEL_3) {
      throw new ForbiddenException(
        'Level 3 affiliates cannot register new affiliates',
      );
    }

    // 🔹 Reutilizamos el flujo de register
    return this.register({
      ...dto,
      parentAffiliateId,
    });
  }
}

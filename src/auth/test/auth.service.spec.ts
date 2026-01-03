/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import * as bcrypt from 'bcrypt';

// import {
//   Affiliate,
//   AffiliateLevel,
//   AffiliateStatus,
// } from '../../affiliates/entities/affiliate.entity';
// import { ConflictException, UnauthorizedException } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { User, UserRole } from '../../users/entities/user.entity';

// import { AuthService } from '../auth.service';
// import { JwtService } from '@nestjs/jwt';
// import { LoginDto } from '../dto/login.dto';
// import { RegisterDto } from '../dto/register.dto';
// //import { Repository } from 'typeorm';
// import { getRepositoryToken } from '@nestjs/typeorm';

// // Tipos para mocks - Versión simplificada que evita el error unbound-method
// type MockRepository<T extends object = any> = {
//   findOne?: jest.Mock<Promise<T | null>, [any]>;
//   create?: jest.Mock<T, [Partial<T>]>;
//   save?: jest.Mock<Promise<T>, [T]>;
// };

// const createMockRepository = <T extends object>(): MockRepository<T> => ({
//   findOne: jest.fn(),
//   create: jest.fn(),
//   save: jest.fn(),
// });

// // Mock de bcrypt
// jest.mock('bcrypt');
// const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// describe('AuthService', () => {
//   let service: AuthService;
//   let userRepository: MockRepository<User>;
//   let affiliateRepository: MockRepository<Affiliate>;
//   let jwtService: JwtService;

//   // Helper para crear mocks seguros
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const mockMethod = <T>(method?: jest.Mock): jest.Mock => {
//     if (!method) {
//       const mock = jest.fn();
//       return mock;
//     }
//     return method;
//   };

//   beforeEach(async () => {
//     // Resetear todos los mocks
//     jest.clearAllMocks();

//     // Configurar mocks de bcrypt
//     mockedBcrypt.hash = jest.fn();
//     mockedBcrypt.compare = jest.fn();

//     // Configurar mocks de JWT
//     const mockJwtService = {
//       sign: jest.fn().mockReturnValue('jwt-token'),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         {
//           provide: getRepositoryToken(User),
//           useValue: createMockRepository<User>(),
//         },
//         {
//           provide: getRepositoryToken(Affiliate),
//           useValue: createMockRepository<Affiliate>(),
//         },
//         {
//           provide: JwtService,
//           useValue: mockJwtService,
//         },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//     userRepository = module.get(getRepositoryToken(User));
//     affiliateRepository = module.get(getRepositoryToken(Affiliate));
//     jwtService = module.get(JwtService);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('register', () => {
//     const registerDto: RegisterDto = {
//       email: 'test@example.com',
//       password: 'Password123!',
//       name: 'Test User',
//     };

//     it('should successfully register a user without parent', async () => {
//       // Arrange
//       const hashedPassword = 'hashedPassword123';

//       // Crear mockUser sin user en affiliate
//       const mockUser: User = {
//         id: 'user-1',
//         email: registerDto.email,
//         name: registerDto.name,
//         role: UserRole.AFFILIATE,
//         password: hashedPassword,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       // Corregir: parent puede ser null
//       const mockAffiliate: Affiliate = {
//         id: 'aff-1',
//         userId: 'user-1',
//         user: mockUser,
//         level: AffiliateLevel.LEVEL_1,
//         commissionRate: 10,
//         status: AffiliateStatus.ACTIVE,
//         totalEarned: 0,
//         parentId: null,
//         parent: null, // Usar 'as any' para evitar error de tipo
//         children: [],
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       // Configurar mocks usando el helper
//       mockMethod(userRepository.findOne).mockResolvedValue(null);
//       mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

//       mockMethod(userRepository.create).mockReturnValue(mockUser);
//       mockMethod(userRepository.save).mockResolvedValue(mockUser);

//       mockMethod(affiliateRepository.create).mockReturnValue({
//         userId: 'user-1',
//         level: AffiliateLevel.LEVEL_1,
//         parentId: null,
//         commissionRate: 10,
//         status: AffiliateStatus.ACTIVE,
//       } as Affiliate);

//       mockMethod(affiliateRepository.save).mockResolvedValue(mockAffiliate);

//       // Configurar el payload esperado para JWT
//       const expectedPayload = {
//         sub: 'user-1',
//         email: registerDto.email,
//         role: UserRole.AFFILIATE,
//         affiliateId: 'aff-1',
//       };

//       // Act
//       const result = await service.register(registerDto);

//       // Assert
//       expect(userRepository.findOne).toHaveBeenCalledWith({
//         where: { email: registerDto.email },
//       });
//       expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);

//       expect(userRepository.create).toHaveBeenCalledWith({
//         email: registerDto.email,
//         password: hashedPassword,
//         name: registerDto.name,
//         role: UserRole.AFFILIATE,
//       });

//       expect(affiliateRepository.create).toHaveBeenCalledWith({
//         userId: 'user-1',
//         level: AffiliateLevel.LEVEL_1,
//         parentId: null,
//         commissionRate: 10,
//         status: AffiliateStatus.ACTIVE,
//       });

//       // eslint-disable-next-line @typescript-eslint/unbound-method
//       expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
//       expect(result.user.email).toBe(registerDto.email);
//       expect(result.affiliate?.level).toBe(AffiliateLevel.LEVEL_1);
//       expect(result.affiliate?.commissionRate).toBe(10);
//       expect(result.access_token).toBe('jwt-token');
//     });

//     it('should register user with parent affiliate', async () => {
//       // Arrange
//       const registerDtoWithParent: RegisterDto = {
//         ...registerDto,
//         parentAffiliateId: 'parent-123',
//       };

//       const hashedPassword = 'hashedPassword123';

//       const mockUser: User = {
//         id: 'user-2',
//         email: registerDto.email,
//         name: registerDto.name,
//         role: UserRole.AFFILIATE,
//         password: hashedPassword,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       // Parent affiliate simplificado
//       const parentAffiliate = {
//         id: 'parent-123',
//         level: AffiliateLevel.LEVEL_1,
//         commissionRate: 10,
//       } as Affiliate;

//       const mockAffiliate = {
//         id: 'aff-2',
//         userId: 'user-2',
//         level: AffiliateLevel.LEVEL_2,
//         commissionRate: 5,
//         parentId: 'parent-123',
//       } as Affiliate;

//       // Configurar mocks
//       mockMethod(userRepository.findOne).mockResolvedValue(null);
//       mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

//       mockMethod(userRepository.create).mockReturnValue(mockUser);
//       mockMethod(userRepository.save).mockResolvedValue(mockUser);

//       mockMethod(affiliateRepository.findOne).mockResolvedValue(
//         parentAffiliate,
//       );
//       mockMethod(affiliateRepository.create).mockReturnValue({
//         userId: 'user-2',
//         level: AffiliateLevel.LEVEL_2,
//         parentId: 'parent-123',
//         commissionRate: 5,
//         status: AffiliateStatus.ACTIVE,
//       } as Affiliate);

//       mockMethod(affiliateRepository.save).mockResolvedValue(mockAffiliate);

//       // Act
//       const result = await service.register(registerDtoWithParent);

//       // Assert
//       expect(affiliateRepository.findOne).toHaveBeenCalledWith({
//         where: { id: 'parent-123' },
//       });
//       expect(result.affiliate?.level).toBe(AffiliateLevel.LEVEL_2);
//       expect(result.affiliate?.commissionRate).toBe(5);
//     });

//     it('should throw ConflictException if email already exists', async () => {
//       // Arrange
//       const existingUser = {
//         id: 'existing-user',
//         email: registerDto.email,
//       } as User;

//       mockMethod(userRepository.findOne).mockResolvedValue(existingUser);

//       // Act & Assert
//       await expect(service.register(registerDto)).rejects.toThrow(
//         ConflictException,
//       );
//     });
//   });

//   describe('login', () => {
//     const loginDto: LoginDto = {
//       email: 'test@example.com',
//       password: 'Password123!',
//     };

//     it('should successfully login user', async () => {
//       // Arrange
//       const hashedPassword = 'hashedPassword';

//       const mockUser: User = {
//         id: 'user-1',
//         email: loginDto.email,
//         password: hashedPassword,
//         name: 'Test User',
//         role: UserRole.AFFILIATE,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       const mockAffiliate = {
//         id: 'aff-1',
//         userId: 'user-1',
//         level: AffiliateLevel.LEVEL_1,
//         commissionRate: 10,
//       } as Affiliate;

//       // Configurar mocks
//       mockMethod(userRepository.findOne).mockResolvedValue(mockUser);
//       mockedBcrypt.compare.mockResolvedValue(true as never);
//       mockMethod(affiliateRepository.findOne).mockResolvedValue(mockAffiliate);

//       // Act
//       const result = await service.login(loginDto);

//       // Assert
//       expect(userRepository.findOne).toHaveBeenCalledWith({
//         where: { email: loginDto.email },
//       });
//       expect(mockedBcrypt.compare).toHaveBeenCalledWith(
//         loginDto.password,
//         hashedPassword,
//       );
//       expect(result.user.email).toBe(loginDto.email);
//       expect(result.affiliate?.id).toBe('aff-1');
//       expect(result.access_token).toBe('jwt-token');
//     });

//     it('should throw UnauthorizedException if user not found', async () => {
//       // Arrange
//       mockMethod(userRepository.findOne).mockResolvedValue(null);

//       // Act & Assert
//       await expect(service.login(loginDto)).rejects.toThrow(
//         UnauthorizedException,
//       );
//     });

//     it('should throw UnauthorizedException if password is incorrect', async () => {
//       // Arrange
//       const mockUser: User = {
//         id: 'user-1',
//         email: loginDto.email,
//         password: 'hashedPassword',
//         name: 'Test User',
//         role: UserRole.AFFILIATE,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       mockMethod(userRepository.findOne).mockResolvedValue(mockUser);
//       mockedBcrypt.compare.mockResolvedValue(false as never);

//       // Act & Assert
//       await expect(service.login(loginDto)).rejects.toThrow(
//         UnauthorizedException,
//       );
//     });

//     it('should handle user without affiliate', async () => {
//       // Arrange
//       const hashedPassword = 'hashedPassword';

//       const mockUser: User = {
//         id: 'user-1',
//         email: loginDto.email,
//         password: hashedPassword,
//         name: 'Test User',
//         role: UserRole.AFFILIATE,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       mockMethod(userRepository.findOne).mockResolvedValue(mockUser);
//       mockedBcrypt.compare.mockResolvedValue(true as never);
//       mockMethod(affiliateRepository.findOne).mockResolvedValue(null);

//       // Act
//       const result = await service.login(loginDto);

//       // Assert
//       expect(result.user.email).toBe(loginDto.email);
//       expect(result.affiliate).toBeNull();
//       expect(result.access_token).toBe('jwt-token');
//     });
//   });
// });

import * as bcrypt from 'bcrypt';

import {
  Affiliate,
  AffiliateLevel,
  AffiliateStatus,
} from '../../affiliates/entities/affiliate.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserRole } from '../../users/entities/user.entity';

import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { getRepositoryToken } from '@nestjs/typeorm';

// Mock completo de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let affiliateRepository: any;
  let jwtService: any;

  beforeEach(async () => {
    // Resetear todos los mocks
    jest.clearAllMocks();

    // Crear mocks simples
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    affiliateRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Affiliate),
          useValue: affiliateRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('should successfully register a user without parent', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Mock user repository
      userRepository.findOne.mockResolvedValue(null);

      const mockUser: Partial<User> = {
        id: 'user-1',
        email: registerDto.email,
        name: registerDto.name,
        role: UserRole.AFFILIATE,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      // Mock affiliate repository
      const mockAffiliate = {
        id: 'aff-1',
        userId: 'user-1',
        level: AffiliateLevel.LEVEL_1,
        commissionRate: 10,
      };

      affiliateRepository.create.mockReturnValue({
        userId: 'user-1',
        level: AffiliateLevel.LEVEL_1,
        parentId: null,
        commissionRate: 10,
        status: AffiliateStatus.ACTIVE,
      });

      affiliateRepository.save.mockResolvedValue(mockAffiliate);

      // Configurar el payload esperado para JWT
      const expectedPayload = {
        sub: 'user-1',
        email: registerDto.email,
        role: UserRole.AFFILIATE,
        affiliateId: 'aff-1',
      };

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);

      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        role: UserRole.AFFILIATE,
      });

      expect(affiliateRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        level: AffiliateLevel.LEVEL_1,
        parentId: null,
        commissionRate: 10,
        status: AffiliateStatus.ACTIVE,
      });

      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
      expect(result.user.email).toBe(registerDto.email);
      expect(result.affiliate?.level).toBe(AffiliateLevel.LEVEL_1);
      expect(result.affiliate?.commissionRate).toBe(10);
      expect(result.access_token).toBe('jwt-token');
    });

    it('should register user with parent affiliate', async () => {
      // Arrange
      const registerDtoWithParent: RegisterDto = {
        ...registerDto,
        parentAffiliateId: 'parent-123',
      };

      const hashedPassword = 'hashedPassword123';

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Mock user repository
      userRepository.findOne.mockResolvedValue(null);

      const mockUser: Partial<User> = {
        id: 'user-2',
        email: registerDto.email,
        name: registerDto.name,
        role: UserRole.AFFILIATE,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      // Mock affiliate repository
      const parentAffiliate = {
        id: 'parent-123',
        level: AffiliateLevel.LEVEL_1,
        commissionRate: 10,
      };

      affiliateRepository.findOne.mockResolvedValue(parentAffiliate);

      const mockAffiliate = {
        id: 'aff-2',
        userId: 'user-2',
        level: AffiliateLevel.LEVEL_2,
        commissionRate: 5,
        parentId: 'parent-123',
      };

      affiliateRepository.create.mockReturnValue({
        userId: 'user-2',
        level: AffiliateLevel.LEVEL_2,
        parentId: 'parent-123',
        commissionRate: 5,
        status: AffiliateStatus.ACTIVE,
      });

      affiliateRepository.save.mockResolvedValue(mockAffiliate);

      // Act
      const result = await service.register(registerDtoWithParent);

      // Assert
      expect(affiliateRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'parent-123' },
      });
      expect(result.affiliate?.level).toBe(AffiliateLevel.LEVEL_2);
      expect(result.affiliate?.commissionRate).toBe(5);
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const existingUser = {
        id: 'existing-user',
        email: registerDto.email,
      };

      userRepository.findOne.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully login user', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword';

      // Mock bcrypt
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock user repository
      const mockUser: Partial<User> = {
        id: 'user-1',
        email: loginDto.email,
        password: hashedPassword,
        name: 'Test User',
        role: UserRole.AFFILIATE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      // Mock affiliate repository
      const mockAffiliate = {
        id: 'aff-1',
        userId: 'user-1',
        level: AffiliateLevel.LEVEL_1,
        commissionRate: 10,
      };

      affiliateRepository.findOne.mockResolvedValue(mockAffiliate);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        hashedPassword,
      );
      expect(result.user.email).toBe(loginDto.email);
      expect(result.affiliate?.id).toBe('aff-1');
      expect(result.access_token).toBe('jwt-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      const mockUser: Partial<User> = {
        id: 'user-1',
        email: loginDto.email,
        password: 'hashedPassword',
        name: 'Test User',
        role: UserRole.AFFILIATE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle user without affiliate', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword';

      // Mock bcrypt
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock user repository
      const mockUser: Partial<User> = {
        id: 'user-1',
        email: loginDto.email,
        password: hashedPassword,
        name: 'Test User',
        role: UserRole.AFFILIATE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      affiliateRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.user.email).toBe(loginDto.email);
      expect(result.affiliate).toBeNull();
      expect(result.access_token).toBe('jwt-token');
    });
  });
});

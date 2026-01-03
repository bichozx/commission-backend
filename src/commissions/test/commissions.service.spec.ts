/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Affiliate,
  AffiliateStatus,
} from '../../affiliates/entities/affiliate.entity';
import { Commission, CommissionStatus } from '../entities/commission.entity';
import { Test, TestingModule } from '@nestjs/testing';

import { CommissionsService } from '../commissions.service';
import { NotFoundException } from '@nestjs/common';
import { Sale } from '../../sales/entities/sale.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CommissionsService', () => {
  let service: CommissionsService;

  // Mocks
  const mockCommissionRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    increment: jest.fn(),
  };

  const mockSaleRepository = {
    findOne: jest.fn(),
  };

  const mockAffiliateRepository = {
    findOne: jest.fn(),
    increment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionsService,
        {
          provide: getRepositoryToken(Commission),
          useValue: mockCommissionRepository,
        },
        {
          provide: getRepositoryToken(Sale),
          useValue: mockSaleRepository,
        },
        {
          provide: getRepositoryToken(Affiliate),
          useValue: mockAffiliateRepository,
        },
      ],
    }).compile();

    service = module.get<CommissionsService>(CommissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateCommissionsForSale', () => {
    it('should calculate 3 levels of commissions for $10000 sale', async () => {
      // Arrange
      const saleId = 'sale-123';

      // Mock de afiliados con estructura COMPLETA
      const mockAffiliate1 = {
        id: 'aff-1',
        parentId: null,
        status: AffiliateStatus.ACTIVE,
        level: 1,
        commissionRate: 2.5,
        totalEarned: 0,
        userId: 'user-1',
        user: { id: 'user-1', name: 'User 1' },
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Affiliate;

      const mockAffiliate2 = {
        id: 'aff-2',
        parentId: 'aff-1',
        status: AffiliateStatus.ACTIVE,
        level: 2,
        commissionRate: 5,
        totalEarned: 0,
        userId: 'user-2',
        user: { id: 'user-2', name: 'User 2' },
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Affiliate;

      const mockAffiliate3 = {
        id: 'aff-3',
        parentId: 'aff-2',
        status: AffiliateStatus.ACTIVE,
        level: 3,
        commissionRate: 10,
        totalEarned: 0,
        userId: 'user-3',
        user: { id: 'user-3', name: 'User 3' },
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Affiliate;

      const sellerAffiliate = {
        id: 'seller-1',
        parentId: 'aff-3', // ¡IMPORTANTE! parentId debe estar definido
        status: AffiliateStatus.ACTIVE,
        level: 4,
        commissionRate: 0,
        totalEarned: 0,
        userId: 'user-seller',
        user: { id: 'user-seller', name: 'Seller' },
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Affiliate;

      const mockSale = {
        id: saleId,
        amount: 10000,
        affiliateId: 'seller-1',
        affiliate: sellerAffiliate, // Incluye el objeto affiliate COMPLETO
        description: 'Test sale',
        saleDate: new Date(),
        createdAt: new Date(),
      } as Sale;

      mockSaleRepository.findOne.mockResolvedValue(mockSale);

      // Mock de búsqueda de afiliados (parent chain)
      mockAffiliateRepository.findOne
        .mockResolvedValueOnce(mockAffiliate3) // Busca parent de seller (aff-3)
        .mockResolvedValueOnce(mockAffiliate2) // Busca parent de aff-3 (aff-2)
        .mockResolvedValueOnce(mockAffiliate1); // Busca parent de aff-2 (aff-1)

      // Mock de save para commission
      let commissionCount = 0;
      mockCommissionRepository.save.mockImplementation((commissionData) => {
        commissionCount++;
        const commission = {
          ...commissionData,
          id: `commission-${commissionCount}`,
          createdAt: new Date(),
        };
        return Promise.resolve(commission);
      });

      // Act
      const commissions = await service.calculateCommissionsForSale(saleId);

      // Assert
      expect(commissions).toHaveLength(3);

      // Verificar llamadas a findOne para buscar afiliados
      expect(mockAffiliateRepository.findOne).toHaveBeenCalledTimes(3);

      // Primera llamada: busca aff-3 (parent de seller)
      expect(mockAffiliateRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: {
          id: 'aff-3',
          status: AffiliateStatus.ACTIVE,
        },
      });

      // Segunda llamada: busca aff-2 (parent de aff-3)
      expect(mockAffiliateRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          id: 'aff-2',
          status: AffiliateStatus.ACTIVE,
        },
      });

      // Tercera llamada: busca aff-1 (parent de aff-2)
      expect(mockAffiliateRepository.findOne).toHaveBeenNthCalledWith(3, {
        where: {
          id: 'aff-1',
          status: AffiliateStatus.ACTIVE,
        },
      });

      // Verificar que se crearon 3 comisiones
      expect(mockCommissionRepository.create).toHaveBeenCalledTimes(3);
      expect(mockCommissionRepository.save).toHaveBeenCalledTimes(3);

      // Verificar increment de totalEarned
      expect(mockAffiliateRepository.increment).toHaveBeenCalledTimes(3);
    });

    it('should throw NotFoundException if sale not found', async () => {
      // Arrange
      mockSaleRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.calculateCommissionsForSale('invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty array if seller has no parent', async () => {
      // Arrange
      const sellerAffiliate = {
        id: 'seller-1',
        parentId: null, // NO tiene parent
        status: AffiliateStatus.ACTIVE,
      } as Affiliate;

      const mockSale = {
        id: 'sale-123',
        amount: 10000,
        affiliate: sellerAffiliate,
      } as Sale;

      mockSaleRepository.findOne.mockResolvedValue(mockSale);

      // Act
      const commissions = await service.calculateCommissionsForSale('sale-123');

      // Assert
      expect(commissions).toHaveLength(0);
      expect(mockAffiliateRepository.findOne).not.toHaveBeenCalled();
    });

    it('should stop when finding inactive affiliate in hierarchy', async () => {
      // Arrange
      const activeAffiliate = {
        id: 'aff-2',
        parentId: 'aff-1',
        status: AffiliateStatus.ACTIVE,
      } as Affiliate;

      const sellerAffiliate = {
        id: 'seller-1',
        parentId: 'aff-2',
        status: AffiliateStatus.ACTIVE,
      } as Affiliate;

      const mockSale = {
        id: 'sale-123',
        amount: 10000,
        affiliate: sellerAffiliate,
      } as Sale;

      mockSaleRepository.findOne.mockResolvedValue(mockSale);

      // Primera llamada: encuentra aff-2 (activo)
      // Segunda llamada: busca aff-1 con status ACTIVE, devuelve null
      mockAffiliateRepository.findOne
        .mockResolvedValueOnce(activeAffiliate) // aff-2 está activo
        .mockResolvedValueOnce(null); // aff-1 no encontrado (está inactivo)

      // Mock de save para commission - ¡IMPORTANTE! Debe incluir affiliateId
      mockCommissionRepository.save.mockImplementation((commissionData) => {
        return Promise.resolve({
          ...commissionData,
          id: 'commission-1',
          affiliateId: commissionData.affiliateId || 'aff-2', // Asegurar affiliateId
          createdAt: new Date(),
        });
      });

      // También mockear create para que devuelva el objeto esperado
      mockCommissionRepository.create.mockImplementation((data) => ({
        ...data,
        id: 'temp-id',
      }));

      // Act
      const commissions = await service.calculateCommissionsForSale('sale-123');

      // Assert
      expect(commissions).toHaveLength(1); // Solo comisión para aff-2
      expect(commissions[0].affiliateId).toBe('aff-2'); // Ahora debería tener affiliateId
      expect(commissions[0].amount).toBe(1000); // 10% de 10000

      // Verificar que solo se buscó hasta aff-1
      expect(mockAffiliateRepository.findOne).toHaveBeenCalledTimes(2);

      // Primera llamada: busca aff-2
      expect(mockAffiliateRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: {
          id: 'aff-2',
          status: AffiliateStatus.ACTIVE,
        },
      });

      // Segunda llamada: busca aff-1
      expect(mockAffiliateRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          id: 'aff-1',
          status: AffiliateStatus.ACTIVE,
        },
      });
    });
  });

  // En la sección "should stop when finding inactive affiliate in hierarchy":
  it('should stop when finding inactive affiliate in hierarchy', async () => {
    // Arrange
    const activeAffiliate = {
      id: 'aff-2',
      parentId: 'aff-1',
      status: AffiliateStatus.ACTIVE,
    } as Affiliate;

    // Este afiliado está INACTIVE
    const inactiveAffiliate = {
      id: 'aff-1',
      parentId: null,
      status: AffiliateStatus.INACTIVE,
    } as Affiliate;

    const sellerAffiliate = {
      id: 'seller-1',
      parentId: 'aff-2',
      status: AffiliateStatus.ACTIVE,
    } as Affiliate;

    const mockSale = {
      id: 'sale-123',
      amount: 10000,
      affiliate: sellerAffiliate,
    } as Sale;

    mockSaleRepository.findOne.mockResolvedValue(mockSale);

    mockAffiliateRepository.findOne
      .mockResolvedValueOnce(activeAffiliate) // aff-2 está activo
      .mockResolvedValueOnce(null); // aff-1 está inactivo, devuelve null ← CAMBIO CRÍTICO

    mockCommissionRepository.save.mockImplementation((commissionData) => ({
      ...commissionData,
      id: 'commission-1',
      createdAt: new Date(),
    }));

    // Act
    const commissions = await service.calculateCommissionsForSale('sale-123');

    // Assert
    expect(commissions).toHaveLength(1); // Solo comisión para aff-2
    expect(commissions[0].affiliateId).toBe('aff-2');
    expect(commissions[0].amount).toBe(1000); // 10% de 10000
  });

  describe('getCommissionStats', () => {
    it('should return correct statistics for affiliate', async () => {
      // Arrange
      const affiliateId = 'aff-1';
      const mockCommissions = [
        {
          id: 'comm-1',
          level: 1,
          amount: 1000,
          percentage: 10,
          status: CommissionStatus.PENDING,
          affiliateId: 'aff-1',
        },
        {
          id: 'comm-2',
          level: 1,
          amount: 500,
          percentage: 10,
          status: CommissionStatus.PAID,
          affiliateId: 'aff-1',
        },
        {
          id: 'comm-3',
          level: 2,
          amount: 250,
          percentage: 5,
          status: CommissionStatus.PENDING,
          affiliateId: 'aff-1',
        },
        {
          id: 'comm-4',
          level: 3,
          amount: 125,
          percentage: 2.5,
          status: CommissionStatus.PAID,
          affiliateId: 'aff-1',
        },
      ] as Commission[];

      mockCommissionRepository.find.mockResolvedValue(mockCommissions);

      // Act
      const stats = await service.getCommissionStats(affiliateId);

      // Assert
      expect(stats.total).toBe(4);
      expect(stats.totalEarned).toBe(1875); // 1000 + 500 + 250 + 125
      expect(stats.pending).toBe(2);
      expect(stats.paid).toBe(2);
      expect(stats.byLevel.level1).toBe(1500); // 1000 + 500
      expect(stats.byLevel.level2).toBe(250);
      expect(stats.byLevel.level3).toBe(125);
    });
  });

  describe('markAsPaid', () => {
    it('should mark commission as paid', async () => {
      // Arrange
      const commissionId = 'comm-1';
      const mockCommission = {
        id: commissionId,
        status: CommissionStatus.PENDING,
        paidAt: null,
      } as unknown as Commission;

      mockCommissionRepository.findOne.mockResolvedValue(mockCommission);
      mockCommissionRepository.save.mockImplementation((updatedCommission) =>
        Promise.resolve({
          ...updatedCommission,
          paidAt: new Date(),
        }),
      );

      // Act
      const result = await service.markAsPaid(commissionId);

      // Assert
      expect(result.status).toBe(CommissionStatus.PAID);
      expect(result.paidAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException if commission not found', async () => {
      // Arrange
      mockCommissionRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.markAsPaid('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCommissionsByLevel', () => {
    it('should return commissions grouped by level', async () => {
      // Arrange
      const affiliateId = 'aff-1';
      const mockCommissions = [
        { level: 1, amount: 1000, percentage: 10 },
        { level: 1, amount: 500, percentage: 10 },
        { level: 2, amount: 250, percentage: 5 },
        { level: 3, amount: 125, percentage: 2.5 },
      ] as Commission[];

      mockCommissionRepository.find.mockResolvedValue(mockCommissions);

      // Act
      const result = await service.getCommissionsByLevel(affiliateId);

      // Assert
      expect(result.totalCommissions).toBe(4);
      expect(result.totalAmount).toBe(1875);
      expect(result.byLevel.level1.count).toBe(2);
      expect(result.byLevel.level1.totalAmount).toBe(1500);
      expect(result.byLevel.level1.percentage).toBe(10);
      expect(result.byLevel.level2.count).toBe(1);
      expect(result.byLevel.level2.totalAmount).toBe(250);
      expect(result.byLevel.level2.percentage).toBe(5);
      expect(result.byLevel.level3.count).toBe(1);
      expect(result.byLevel.level3.totalAmount).toBe(125);
      expect(result.byLevel.level3.percentage).toBe(2.5);
    });
  });

  describe('getCommissionHierarchy', () => {
    it('should return commission hierarchy', async () => {
      // Arrange
      const affiliateId = 'aff-1';
      const mockAffiliate = {
        id: affiliateId,
        user: { name: 'Test User', email: 'test@test.com' },
        totalEarned: 1000,
        level: 1,
        parent: {
          id: 'parent-1',
          user: { name: 'Parent', email: 'parent@test.com' },
        },
      } as Affiliate;

      mockAffiliateRepository.findOne.mockResolvedValue(mockAffiliate);

      // Mock para calculateCommissionsFromAffiliate
      const mockCommissions = [{ amount: 500 }] as Commission[];
      mockCommissionRepository.find.mockResolvedValue(mockCommissions);

      // Act
      const result = await service.getCommissionHierarchy(affiliateId);

      // Assert
      expect(result.current.id).toBe(affiliateId);
      expect(result.current.name).toBe('Test User');
      expect(result.current.totalEarned).toBe(1000);
      expect(result.current.level).toBe(1);
      expect(result.level1).toBeDefined();
      expect(result.level1?.id).toBe('parent-1');
    });

    it('should throw NotFoundException if affiliate not found', async () => {
      // Arrange
      mockAffiliateRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getCommissionHierarchy('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllCommissions', () => {
    it('should return all commissions', async () => {
      // Arrange
      const mockCommissions = [
        { id: 'comm-1', level: 1, amount: 1000 },
        { id: 'comm-2', level: 2, amount: 500 },
      ] as Commission[];

      mockCommissionRepository.find.mockResolvedValue(mockCommissions);

      // Act
      const result = await service.getAllCommissions();

      // Assert
      expect(result).toHaveLength(2);
      expect(mockCommissionRepository.find).toHaveBeenCalledWith({
        relations: ['sale', 'affiliate', 'affiliate.user', 'sale.affiliate'],
        order: { createdAt: 'DESC' },
      });
    });
  });
});

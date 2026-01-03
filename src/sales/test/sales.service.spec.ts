import { Test, TestingModule } from '@nestjs/testing';

import { CommissionsService } from '../../commissions/commissions.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { SalesService } from '../sales.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SalesService', () => {
  let service: SalesService;
  let saleRepo: Repository<Sale>;
  let commissionsService: CommissionsService;

  const mockSaleRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCommissionsService = {
    calculateCommissionsForSale: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getRepositoryToken(Sale),
          useValue: mockSaleRepo,
        },
        {
          provide: CommissionsService,
          useValue: mockCommissionsService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    saleRepo = module.get<Repository<Sale>>(getRepositoryToken(Sale));
    commissionsService = module.get<CommissionsService>(CommissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a sale and calculate commissions', async () => {
      // Arrange
      const createSaleDto: CreateSaleDto = {
        amount: 10000,
        description: 'Test sale',
      };

      const affiliateId = 'aff-1';

      const mockSale = {
        id: 'sale-1',
        affiliateId,
        amount: 10000,
        description: 'Test sale',
        saleDate: new Date(),
        createdAt: new Date(),
      };

      const mockCommissions = [
        { id: 'comm-1', level: 1, amount: 1000, percentage: 10 },
        { id: 'comm-2', level: 2, amount: 500, percentage: 5 },
        { id: 'comm-3', level: 3, amount: 250, percentage: 2.5 },
      ];

      mockSaleRepo.create.mockReturnValue(mockSale);
      mockSaleRepo.save.mockResolvedValue(mockSale);
      mockCommissionsService.calculateCommissionsForSale.mockResolvedValue(
        mockCommissions,
      );

      // Act
      const result = await service.create(createSaleDto, affiliateId);

      // Assert
      expect(mockSaleRepo.create).toHaveBeenCalledWith({
        amount: 10000,
        description: 'Test sale',
        affiliateId,
      });

      expect(mockSaleRepo.save).toHaveBeenCalledWith(mockSale);

      expect(
        // eslint-disable-next-line @typescript-eslint/unbound-method
        commissionsService.calculateCommissionsForSale,
      ).toHaveBeenCalledWith('sale-1');

      expect(result.sale).toEqual(mockSale);
      expect(result.commissions).toEqual(mockCommissions);
      expect(result.message).toContain('3 commission(s) calculated');
    });

    it('should handle sale without description', async () => {
      // Arrange
      const createSaleDto: CreateSaleDto = {
        amount: 5000,
      };

      const affiliateId = 'aff-1';

      const mockSale = {
        id: 'sale-1',
        affiliateId,
        amount: 5000,
        description: null,
        saleDate: new Date(),
        createdAt: new Date(),
      };

      mockSaleRepo.create.mockReturnValue(mockSale);
      mockSaleRepo.save.mockResolvedValue(mockSale);
      mockCommissionsService.calculateCommissionsForSale.mockResolvedValue([]);

      // Act
      const result = await service.create(createSaleDto, affiliateId);

      // Assert
      expect(mockSaleRepo.create).toHaveBeenCalledWith({
        amount: 5000,
        description: undefined,
        affiliateId,
      });
      expect(result.sale.description).toBeNull();
    });
  });

  describe('findAllByAffiliate', () => {
    it('should return sales for affiliate', async () => {
      // Arrange
      const affiliateId = 'aff-1';
      const mockSales = [
        { id: 'sale-1', amount: 10000, affiliateId },
        { id: 'sale-2', amount: 5000, affiliateId },
      ];

      mockSaleRepo.find.mockResolvedValue(mockSales);

      // Act
      const result = await service.findAllByAffiliate(affiliateId);

      // Assert
      expect(mockSaleRepo.find).toHaveBeenCalledWith({
        where: { affiliateId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockSales);
    });

    it('should return empty array if no sales', async () => {
      // Arrange
      const affiliateId = 'aff-1';
      mockSaleRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.findAllByAffiliate(affiliateId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findOneWithCommissions', () => {
    it('should return sale with relations', async () => {
      // Arrange
      const saleId = 'sale-1';
      const mockSale = {
        id: saleId,
        amount: 10000,
        affiliate: { id: 'aff-1', user: { name: 'Test User' } },
      };

      mockSaleRepo.findOne.mockResolvedValue(mockSale);

      // Act
      const result = await service.findOneWithCommissions(saleId);

      // Assert
      expect(mockSaleRepo.findOne).toHaveBeenCalledWith({
        where: { id: saleId },
        relations: ['affiliate', 'affiliate.user'],
      });
      expect(result).toEqual(mockSale);
    });

    it('should throw NotFoundException if sale not found', async () => {
      // Arrange
      mockSaleRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOneWithCommissions('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should calculate correct statistics', async () => {
      // Arrange
      const affiliateId = 'aff-1';
      const mockSales = [
        { amount: '10000' },
        { amount: '5000' },
        { amount: '3000' },
      ];

      jest
        .spyOn(service, 'findAllByAffiliate')
        .mockResolvedValue(mockSales as any);

      // Act
      const stats = await service.getStats(affiliateId);

      // Assert
      expect(stats.totalSales).toBe(3);
      expect(stats.totalRevenue).toBe(18000); // 10000 + 5000 + 3000
      expect(stats.avgSaleAmount).toBe(6000); // 18000 / 3
    });

    it('should handle zero sales', async () => {
      // Arrange
      const affiliateId = 'aff-1';
      jest.spyOn(service, 'findAllByAffiliate').mockResolvedValue([]);

      // Act
      const stats = await service.getStats(affiliateId);

      // Assert
      expect(stats.totalSales).toBe(0);
      expect(stats.totalRevenue).toBe(0);
      expect(stats.avgSaleAmount).toBe(0);
    });
  });
});

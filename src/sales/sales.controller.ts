import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../common/interface/request-with-user.interface';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new sale and calculate commissions automatically',
    description: `
  ## 📈 Creates a sale and automatically calculates 3-level commissions
  
  ### Commission Structure:
  - **Level 1** (Direct referrer): 10% of sale amount
  - **Level 2** (Second level): 5% of sale amount  
  - **Level 3** (Third level): 2.5% of sale amount
  
  ### Example Calculation:
  For a $1,000 sale:
  - Level 1: $100 (10%)
  - Level 2: $50 (5%)
  - Level 3: $25 (2.5%)
  - **Total distributed**: $175 (17.5% of sale amount)
  
  *Commissions are calculated upward in the hierarchy from the selling affiliate.*
  `,
  })
  @ApiResponse({
    status: 201,
    description: '✅ Sale created successfully with commission calculation',
    schema: {
      example: {
        sale: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          amount: 1000.5,
          description: 'Premium product sale',
          affiliateId: 'aff-123',
          createdAt: '2024-01-15T10:30:00.000Z',
        },
        commissions: [
          {
            id: 'comm-1',
            level: 1,
            percentage: 10,
            amount: 100.05,
            toAffiliateId: 'aff-456',
            status: 'pending',
          },
          {
            id: 'comm-2',
            level: 2,
            percentage: 5,
            amount: 50.025,
            toAffiliateId: 'aff-789',
            status: 'pending',
          },
          {
            id: 'comm-3',
            level: 3,
            percentage: 2.5,
            amount: 25.0125,
            toAffiliateId: 'aff-101',
            status: 'pending',
          },
        ],
        message:
          '✅ Sale created successfully. 3 commissions calculated with percentages: Level 1 (10%), Level 2 (5%), Level 3 (2.5%).',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '❌ Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 400,
    description: '❌ Bad Request - Invalid sale data',
  })
  async create(
    @Body() createSaleDto: CreateSaleDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.salesService.create(createSaleDto, req.user.affiliateId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all sales for current affiliate',
    description: 'Returns a list of all sales made by the current affiliate',
  })
  @ApiResponse({
    status: 200,
    description: '✅ List of sales retrieved successfully',
    schema: {
      example: [
        {
          id: 'sale-1',
          amount: 1000.5,
          description: 'Premium subscription',
          affiliateId: 'aff-123',
          createdAt: '2024-01-15T10:30:00.000Z',
          commissions: [
            { level: 1, amount: 100.05, status: 'pending' },
            { level: 2, amount: 50.025, status: 'pending' },
          ],
        },
        {
          id: 'sale-2',
          amount: 500.0,
          description: 'Basic product',
          affiliateId: 'aff-123',
          createdAt: '2024-01-14T14:20:00.000Z',
          commissions: [{ level: 1, amount: 50.0, status: 'paid' }],
        },
      ],
    },
  })
  async findAll(@Request() req: RequestWithUser) {
    return await this.salesService.findAllByAffiliate(req.user.affiliateId);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get sales statistics',
    description:
      'Returns aggregated statistics for sales made by the current affiliate',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Sales statistics retrieved',
    schema: {
      example: {
        totalSales: 15,
        totalRevenue: 12500.75,
        avgSaleAmount: 833.38,
        commissionGenerated: 2187.63, // 17.5% of total revenue
        byMonth: [
          { month: 'Jan 2024', sales: 5, revenue: 4500.5 },
          { month: 'Dec 2023', sales: 10, revenue: 8000.25 },
        ],
      },
    },
  })
  async getStats(@Request() req: RequestWithUser) {
    return await this.salesService.getStats(req.user.affiliateId);
  }

  @Get(':saleId')
  @ApiOperation({
    summary: 'Get sale details',
    description:
      'Returns detailed information about a specific sale including commissions',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Sale details retrieved',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 1000.5,
        description: 'Annual premium subscription',
        affiliateId: 'aff-123',
        affiliate: {
          id: 'aff-123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        commissions: [
          {
            id: 'comm-1',
            level: 1,
            percentage: 10,
            amount: 100.05,
            affiliate: {
              id: 'aff-456',
              name: 'Jane Smith',
            },
            status: 'pending',
            createdAt: '2024-01-15T10:30:00.000Z',
          },
          {
            id: 'comm-2',
            level: 2,
            percentage: 5,
            amount: 50.025,
            affiliate: {
              id: 'aff-789',
              name: 'Robert Johnson',
            },
            status: 'pending',
            createdAt: '2024-01-15T10:30:00.000Z',
          },
        ],
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '❌ Sale not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Sale with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id') id: string) {
    return await this.salesService.findOneWithCommissions(id);
  }
}

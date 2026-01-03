import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
//import { Commission } from './entities/commission.entity';

@ApiTags('commissions')
@ApiBearerAuth() // Para Swagger
@UseGuards(JwtAuthGuard)
@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Post('calculate/:saleId')
  @ApiOperation({ summary: 'Calculate commissions for a sale' })
  @ApiParam({ name: 'saleId', description: 'Sale ID' })
  async calculateCommissions(@Param('saleId') saleId: string) {
    return this.commissionsService.calculateCommissionsForSale(saleId);
  }

  @Get('affiliate/:affiliateId')
  @ApiOperation({ summary: 'Get commissions by affiliate' })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  async getByAffiliate(@Param('affiliateId') affiliateId: string) {
    return this.commissionsService.getCommissionsByAffiliate(affiliateId);
  }

  @Get('stats/:affiliateId')
  @ApiOperation({ summary: 'Get commission statistics' })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  async getStats(@Param('affiliateId') affiliateId: string) {
    return this.commissionsService.getCommissionStats(affiliateId);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all commissions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllCommissions(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    if (page && limit) {
      return this.commissionsService.getPaginatedCommissions(page, limit);
    }
    return this.commissionsService.getAllCommissions();
  }

  @Post('mark-paid/:commissionId')
  @ApiOperation({ summary: 'Mark commission as paid' })
  @ApiParam({ name: 'commissionId', description: 'Commission ID' })
  async markAsPaid(@Param('commissionId') commissionId: string) {
    return this.commissionsService.markAsPaid(commissionId);
  }

  @Get('hierarchy/:affiliateId')
  @ApiOperation({ summary: 'Get commission hierarchy' })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  async getHierarchy(@Param('affiliateId') affiliateId: string) {
    return this.commissionsService.getCommissionHierarchy(affiliateId);
  }

  @Get('by-level/:affiliateId')
  @ApiOperation({ summary: 'Get commissions grouped by level' })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  async getByLevel(@Param('affiliateId') affiliateId: string) {
    return this.commissionsService.getCommissionsByLevel(affiliateId);
  }

  @Get('total/:affiliateId')
  @ApiOperation({ summary: 'Get total commission amount' })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  async getTotalAmount(@Param('affiliateId') affiliateId: string) {
    return this.commissionsService.getTotalCommissionAmount(affiliateId);
  }
}

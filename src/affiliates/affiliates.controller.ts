import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AffiliatesService } from './affiliates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AffiliateHierarchyResponse } from '../common/interface/affiliate-hierarchy.interface';
import { AffiliateTreeNode } from '../common/interface/affiliate-tree.interface';
import type { RequestWithUser } from '../common/interface/request-with-user.interface';

import { Body, Param, Query, Post, Put } from '@nestjs/common';
import {
  CreateAffiliateDto,
  UpdateAffiliateDto,
} from './dto/CreateAffiliateDto';
import { Affiliate } from './entities/affiliate.entity';
import { GetAffiliatesDto } from './dto/GetAffiliatesDto';

@ApiTags('affiliates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  // GET endpoints existentes...
  @Get('hierarchy')
  async getHierarchy(
    @Request() req: RequestWithUser,
  ): Promise<AffiliateHierarchyResponse> {
    return await this.affiliatesService.getHierarchy(req.user.affiliateId);
  }

  @Get('tree/:id')
  @ApiOperation({ summary: 'Get complete affiliate tree for frontend' })
  @ApiResponse({
    status: 200,
    description: 'Affiliate tree',
    type: AffiliateTreeNode,
  })
  async getCompleteTree(
    @Param('id') affiliateId: string,
  ): Promise<AffiliateTreeNode> {
    return this.affiliatesService.getCompleteTree(affiliateId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo afiliado' })
  @ApiResponse({
    status: 201,
    description: 'Afiliado creado correctamente',
    type: Affiliate,
  })
  async createAffiliate(@Body() dto: CreateAffiliateDto): Promise<Affiliate> {
    return this.affiliatesService.createAffiliate(dto.userId, dto.parentId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos de un afiliado' })
  @ApiResponse({
    status: 200,
    description: 'Afiliado actualizado correctamente',
    type: Affiliate,
  })
  async updateAffiliate(
    @Param('id') id: string,
    @Body() dto: UpdateAffiliateDto,
  ): Promise<Affiliate> {
    return this.affiliatesService.updateAffiliate(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List affiliates, optionally by level' })
  @ApiResponse({
    status: 200,
    description: 'List of affiliates',
    type: [Affiliate],
  })
  async listAffiliates(@Query() query: GetAffiliatesDto): Promise<Affiliate[]> {
    return this.affiliatesService.getAffiliatesByLevel(query.level);
  }
}

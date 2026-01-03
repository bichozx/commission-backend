// import { Controller } from '@nestjs/common';

// @Controller('affiliates')
// export class AffiliatesController {}

// import { Controller, Get, UseGuards, Request } from '@nestjs/common';
// import {
//   ApiTags,
//   ApiOperation,
//   ApiResponse,
//   ApiBearerAuth,
// } from '@nestjs/swagger';
// import { AffiliatesService } from './affiliates.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { AffiliateHierarchyResponse } from '../common/interface/affiliate-hierarchy.interface';
// import type { RequestWithUser } from '../common/interface/request-with-user.interface';

// @ApiTags('affiliates')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
// @Controller('affiliates')
// export class AffiliatesController {
//   constructor(private readonly affiliatesService: AffiliatesService) {}

//   @Get('hierarchy')
//   @ApiOperation({
//     summary: 'Get complete affiliate hierarchy',
//     description: `
//     ## 🏢 Complete Affiliate Hierarchy Structure

//     Returns the full hierarchical structure showing:
//     - **Current affiliate** information
//     - **Upline** (up to 3 levels above you)
//     - **Downline** (affiliates you referred directly)

//     ### 📊 Commission Percentages by Level:
//     - **Level 1** (Direct referrer): 10% commission
//     - **Level 2** (Second level): 5% commission
//     - **Level 3** (Third level): 2.5% commission

//     ### 📈 Response Includes:
//     - Basic info for each affiliate (name, email, join date)
//     - Commission percentage for upline levels
//     - Total earnings for each affiliate
//     - Direct downline count and list
//     - Total downline count (including indirect referrals)

//     *This endpoint provides a complete view of your position in the affiliate network.*
//     `,
//   })
//   @ApiResponse({
//     status: 200,
//     description: '✅ Affiliate hierarchy retrieved successfully',
//     type: AffiliateHierarchyResponse,
//   })
//   @ApiResponse({
//     status: 404,
//     description: '❌ Affiliate not found',
//     content: {
//       'application/json': {
//         example: {
//           statusCode: 404,
//           message: 'Affiliate with ID uuid-123 not found',
//           error: 'Not Found',
//         },
//       },
//     },
//   })
//   async getHierarchy(
//     @Request() req: RequestWithUser,
//   ): Promise<AffiliateHierarchyResponse> {
//     return await this.affiliatesService.getHierarchy(req.user.affiliateId);
//   }

//   @Get('tree')
//   @ApiOperation({
//     summary: 'Get complete affiliate tree structure',
//     description:
//       'Returns the complete hierarchical tree starting from current affiliate (including all downline levels)',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Complete affiliate tree',
//     schema: {
//       example: {
//         id: 'aff-123',
//         name: 'John Doe',
//         level: 1,
//         totalEarned: 1500.75,
//         children: [
//           {
//             id: 'aff-456',
//             name: 'Jane Smith',
//             level: 2,
//             totalEarned: 800.25,
//             children: [
//               {
//                 id: 'aff-789',
//                 name: 'Robert Johnson',
//                 level: 3,
//                 totalEarned: 400.5,
//                 children: [],
//               },
//             ],
//           },
//         ],
//       },
//     },
//   })
//   async getCompleteTree(@Request() req: RequestWithUser) {
//     return await this.affiliatesService.getCompleteTree(req.user.affiliateId);
//   }
// }

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

@ApiTags('affiliates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Get('hierarchy')
  @ApiOperation({
    summary: 'Get complete affiliate hierarchy',
    description: `
    ## 🏢 Complete Affiliate Hierarchy Structure
    
    Returns the full hierarchical structure showing:
    - **Current affiliate** information
    - **Upline** (up to 3 levels above you)
    - **Downline** (affiliates you referred directly)
    
    ### 📊 Commission Percentages by Level:
    - **Level 1** (Direct referrer): 10% commission
    - **Level 2** (Second level): 5% commission  
    - **Level 3** (Third level): 2.5% commission
    
    ### 📈 Response Includes:
    - Basic info for each affiliate (name, email, join date)
    - Commission percentage for upline levels
    - Total earnings for each affiliate
    - Direct downline count and list
    - Total downline count (including indirect referrals)
    
    *This endpoint provides a complete view of your position in the affiliate network.*
    `,
  })
  @ApiResponse({
    status: 200,
    description: '✅ Affiliate hierarchy retrieved successfully',
    type: AffiliateHierarchyResponse,
  })
  @ApiResponse({
    status: 404,
    description: '❌ Affiliate not found',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Affiliate with ID uuid-123 not found',
          error: 'Not Found',
        },
      },
    },
  })
  async getHierarchy(
    @Request() req: RequestWithUser,
  ): Promise<AffiliateHierarchyResponse> {
    return await this.affiliatesService.getHierarchy(req.user.affiliateId);
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Get complete affiliate tree structure',
    description:
      'Returns the complete hierarchical tree starting from current affiliate (including all downline levels)',
  })
  @ApiResponse({
    status: 200,
    description: 'Complete affiliate tree',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'aff-123' },
        name: { type: 'string', example: 'John Doe' },
        level: { type: 'integer', example: 1 },
        totalEarned: { type: 'number', example: 1500.75 },
        children: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/AffiliateTreeNode',
          },
        },
      },
    },
    // Si usas el schema de referencia
    type: AffiliateTreeNode,
  })
  async getCompleteTree(
    @Request() req: RequestWithUser,
  ): Promise<AffiliateTreeNode> {
    return await this.affiliatesService.getCompleteTree(req.user.affiliateId);
  }
}

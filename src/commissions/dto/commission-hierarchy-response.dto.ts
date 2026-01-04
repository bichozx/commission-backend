// src/commissions/dto/commission-hierarchy-response.dto.ts

import {
  CommissionHierarchyNode,
  CommissionHierarchyResponse,
} from '../../common/interface/commissions.interface';

export class CommissionHierarchyResponseDto implements CommissionHierarchyResponse {
  current: CommissionHierarchyNode;
  uplines: CommissionHierarchyNode[];
}

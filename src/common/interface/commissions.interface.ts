// src/commissions/interfaces/commissions.interface.ts
export interface LevelStats {
  count: number;
  totalAmount: number;
  percentage: number;
  description: string;
}

export interface CommissionsByLevelResponse {
  totalCommissions: number;
  totalAmount: number;
  byLevel: {
    level1: LevelStats;
    level2: LevelStats;
    level3: LevelStats;
  };
}

export interface CommissionStatsResponse {
  total: number;
  totalEarned: number;
  pending: number;
  paid: number;
  byLevel: {
    level1: number;
    level2: number;
    level3: number;
  };
}

// src/commissions/interfaces/commission-hierarchy.interface.ts
export interface HierarchyLevelInfo {
  id: string;
  name: string;
  email?: string;
  commissionPercentage: number;
  totalEarnedFromYou: number;
  totalCommissionsFromYou: number;
}

// export interface CommissionHierarchyResponse {
//   current: {
//     id: string;
//     name: string;
//     totalEarned: number;
//     level: number;
//   };
//   level1?: HierarchyLevelInfo;
//   level2?: HierarchyLevelInfo;
//   level3?: HierarchyLevelInfo;
// }

export interface CommissionHierarchyNode {
  id: string;
  name: string;
  email?: string;

  level: number; // ✅ REAL desde BD
  parentId: string | null;

  // Solo current
  totalEarned?: number;

  // Solo uplines
  commissionPercentage?: number;
  totalEarnedFromYou?: number;
  totalCommissionsFromYou?: number;
}

export interface CommissionHierarchyResponse {
  current: CommissionHierarchyNode;
  uplines: CommissionHierarchyNode[];
}

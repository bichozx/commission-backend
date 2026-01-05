import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum AffiliateLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  SELLER = 4,
}

export enum AffiliateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('affiliates')
export class Affiliate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: AffiliateLevel,
    default: AffiliateLevel.LEVEL_1,
  })
  level: AffiliateLevel;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null; // ← CAMBIO AQUÍ: agregamos | null

  @ManyToOne(() => Affiliate, (affiliate) => affiliate.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Affiliate | null; // ← CAMBIO AQUÍ: agregamos | null

  @OneToMany(() => Affiliate, (affiliate) => affiliate.parent)
  children: Affiliate[];

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEarned: number;

  @Column({
    type: 'enum',
    enum: AffiliateStatus,
    default: AffiliateStatus.ACTIVE,
  })
  status: AffiliateStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

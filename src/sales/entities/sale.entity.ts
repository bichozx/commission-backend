import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Affiliate } from '../../affiliates/entities/affiliate.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  affiliateId: string;

  @ManyToOne(() => Affiliate)
  @JoinColumn({ name: 'affiliateId' })
  affiliate: Affiliate;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  saleDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}

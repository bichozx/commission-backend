import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Affiliate } from '../../affiliates/entities/affiliate.entity';
import { Sale } from '../../sales/entities/sale.entity';

export enum CommissionStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  saleId: string;

  @ManyToOne(() => Sale)
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @Column({ type: 'uuid' })
  affiliateId: string;

  @ManyToOne(() => Affiliate)
  @JoinColumn({ name: 'affiliateId' })
  affiliate: Affiliate;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage: number;

  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;
}

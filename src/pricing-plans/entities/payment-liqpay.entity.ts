import { User } from 'src/UserAuthCommon/user/entities/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Plan } from './plan.entity';

@Entity()
export class SubscriptionLiqpay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'pending', 'canceled', 'failed', 'expired'],
    default: 'pending',
  })
  status: 'active' | 'inactive' | 'pending' | 'canceled' | 'failed' | 'expired';

  @Column({ nullable: true, name: 'current_period_start' })
  currentPeriodStart: Date;

  @Column({ nullable: true, name: 'current_period_end' })
  currentPeriodEnd: Date;

  @Column({ nullable: false, default: 'free' })
  type: string;

  @Column({ nullable: true, name: 'liqpay_order_id' })
  liqpayOrderId: string; // system LiqPay ID

  @Column({ nullable: true, name: 'liqpay_transaction_id' })
  liqpayTransactionId: number; // transaction_id from LiqPay

  @Column({ nullable: true, name: 'payment_id' })
  liqpayPaymentId: number; // payment_id from LiqPay

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;

  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  plan: Plan;
}

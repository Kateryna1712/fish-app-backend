import { User } from 'src/UserAuthCommon/user/entities/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Plan } from './plan.entity';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'stripe_subscription_id' })
  stripeSubscriptionId: string;

  @Column({ name: 'stripe_customer_id' })
  stripeCustomerId: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'pending', 'canceled', 'failed', 'expired'],
    default: 'inactive',
  })
  status: 'active' | 'inactive' | 'pending' | 'canceled' | 'failed' | 'expired';

  @Column({ nullable: true, name: 'current_period_start' })
  currentPeriodStart: Date;

  @Column({ nullable: true, name: 'current_period_end' })
  currentPeriodEnd: Date;

  @Column({ nullable: false, default: 'free' })
  type: string;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;

  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  plan: Plan;

  // @OneToOne(() => Profile, (profile) => profile.user)
  // profile: Profile;

  // @OneToMany(() => Order, (order) => order.user)
  // orders: Order[];
}

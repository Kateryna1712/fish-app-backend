import { User } from 'src/UserAuthCommon/user/entities/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity()
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, name: 'stripe_plan_id' })
  stripePlanId: string; // ID of the plan(product) in Stripe

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: true, name: 'stripe_price_id' })
  stripePriceId: string; // ID of the plan in Stripe (Price ID)

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: false, type: 'text' })
  description: string;

  @Column({ nullable: false })
  permission: string;

  @Column({ nullable: true, name: 'places_number' })
  placesNumber: number;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions?: Subscription[];

  // @OneToOne(() => Profile, (profile) => profile.user)
  // profile: Profile;

  // @OneToMany(() => Order, (order) => order.user)
  // orders: Order[];
}

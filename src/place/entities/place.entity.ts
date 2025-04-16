import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Auth } from 'src/UserAuthCommon/auth/entities/auth.entity';
import { Subscription } from 'src/pricing-plans/entities/subscription.entity';
import { Invitation } from 'src/invite-friend/entities/invite-friend.entity';
import { User } from 'src/UserAuthCommon/user/entities/user.entity';

@Entity()
export class Place {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, type: 'float8' })
  lat: number;

  @Column({ nullable: false, type: 'float8' })
  lon: number;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;

  @ManyToOne(() => User, (user) => user.places, { onDelete: 'CASCADE' })
  user: User;
}

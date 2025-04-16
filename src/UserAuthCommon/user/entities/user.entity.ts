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
import { Place } from 'src/place/entities/place.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  /*
   * Select indicates row selection in QueryBuilder
   * Default value is "true".
   */
  @Column({ nullable: false, select: false })
  password: string;

  // @Column({ nullable: false, select: false })
  // password: string;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;

  @OneToOne(() => Auth, (auth) => auth.user)
  auth: Auth;

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions?: Subscription[];

  @OneToOne(() => Invitation, (invitation) => invitation.owner)
  invitation: Invitation;

  @OneToOne(() => Invitation, (invitation) => invitation.friend)
  friend: Invitation;

  @OneToMany(() => Place, (place) => place.user)
  places?: Place[];
  // @OneToOne(() => Profile, (profile) => profile.user)
  // profile: Profile;

  // @OneToMany(() => Order, (order) => order.user)
  // orders: Order[];
}

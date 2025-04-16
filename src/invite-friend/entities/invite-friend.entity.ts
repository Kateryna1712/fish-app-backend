import { User } from 'src/UserAuthCommon/user/entities/user.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  accepted: boolean;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;

  @OneToOne(() => User, (user) => user.invitation)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToOne(() => User, (user) => user.friend)
  @JoinColumn({ name: 'friend_id' })
  friend: User;
}

import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Auth } from './auth.entity';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  otp: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => "CURRENT_TIMESTAMP + interval '10 minutes'",
  })
  expiration: Date;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @OneToOne(() => Auth, (auth) => auth.otp)
  @JoinColumn({ name: 'auth_id' })
  auth: Auth;
}

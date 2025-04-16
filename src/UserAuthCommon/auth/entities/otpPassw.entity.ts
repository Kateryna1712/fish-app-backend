import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Auth } from './auth.entity';

@Entity('otp_passw')
export class OtpPassw {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  otp: string;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  expiration: Date;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @OneToOne(() => Auth, (auth) => auth.otpPassw)
  @JoinColumn({ name: 'auth_id' })
  auth: Auth;
}

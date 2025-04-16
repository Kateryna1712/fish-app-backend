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
import { Otp } from './otp.entity';
import { OtpPassw } from './otpPassw.entity';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true })
  method: string;

  @Column({ nullable: true })
  token: string;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @CreateDateColumn({ nullable: true })
  time: Date;

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @UpdateDateColumn({ name: 'updated_on' })
  updatedOn: Date;

  @OneToOne(() => User, (user) => user.auth)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Otp, (otp) => otp.auth)
  otp: Otp;

  @OneToOne(() => OtpPassw, (otpPassw) => otpPassw.auth)
  otpPassw: Otp;
}

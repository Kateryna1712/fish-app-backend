import { Module } from '@nestjs/common';
import { InviteFriendService } from './invite-friend.service';
import { InviteFriendController } from './invite-friend.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from './entities/invite-friend.entity';
import { EmailModule } from 'src/3d-party/email/email.module';
import { AuthGuardModule } from 'src/shared/auth-guard/auth-guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation]),
    EmailModule,
    AuthGuardModule,
  ],
  controllers: [InviteFriendController],
  providers: [InviteFriendService],
})
export class InviteFriendModule {}

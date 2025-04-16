import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { InviteFriendService } from './invite-friend.service';
import { InviteFriendDto } from './dto/create-invite-friend.dto';
import { AuthGuard } from 'src/shared/auth-guard/auth.guard';
import { RequestWithUser } from 'src/UserAuthCommon/user/interfaces/user.interfaces';

@Controller('invite')
export class InviteFriendController {
  constructor(private readonly inviteFriendService: InviteFriendService) {}

  @UseGuards(AuthGuard)
  @Post()
  inviteFriend(
    @Req() request: RequestWithUser,
    @Body() createInviteFriendDto: InviteFriendDto,
  ) {
    return this.inviteFriendService.inviteFriend(
      request.userId,
      request.email,
      createInviteFriendDto,
    );
  }
}

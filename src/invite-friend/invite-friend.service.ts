import { Injectable, Logger } from '@nestjs/common';
import { InviteFriendDto } from './dto/create-invite-friend.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './entities/invite-friend.entity';
import { EmailService } from 'src/3d-party/email/email.service';

@Injectable()
export class InviteFriendService {
  private logger = new Logger(InviteFriendService.name);

  private appLink = 'app link';
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private readonly emailService: EmailService,
  ) {}

  async inviteFriend(
    userId: string,
    inviterEmail: string,
    createInviteFriendDto: InviteFriendDto,
  ) {
    console.log('-=-=-=-=-=-=userId', userId);
    const invitationDb = await this.invitationRepository.findOne({
      where: { owner: { id: userId } },
    });

    if (invitationDb && invitationDb.accepted) {
      return { message: 'You have already invited a friend' };
    }

    await this.invitationRepository.upsert(
      {
        ...createInviteFriendDto,
        owner: { id: userId },
      },
      ['owner'],
    );

    await this.emailService.sendInvitation(
      inviterEmail,
      createInviteFriendDto.email,
      this.appLink,
    );
  }
}

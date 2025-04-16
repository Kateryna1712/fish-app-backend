import { Injectable, Logger } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailOptions } from './interfaces/EmaiilOptions.interface';
import { EmailTemplateService } from './email-template.service.';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  async sendEmailVerify(email: string, otpCode: string) {
    const html =
      this.emailTemplateService.generateEmailConfirmationHtml(otpCode);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Fish app: Email Verification Code',
      html,
    };

    return await this.sendMail(mailOptions);
  }

  async sendEmailResetPassword(email: string, otpCode: string) {
    const html =
      this.emailTemplateService.generateEmailResetPasswordHtml(otpCode);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Fish app: Password Reset Code',
      html,
    };

    return await this.sendMail(mailOptions);
  }

  async sendInvitation(inviterName: string, email: string, link: string) {
    const html = this.emailTemplateService.generateInvitationHtml(
      inviterName,
      link,
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Fish app: invitation',
      html,
    };

    return await this.sendMail(mailOptions);
  }

  async sendMail(emailOptions: EmailOptions) {
    try {
      const res = await this.mailerService.sendMail(emailOptions);

      return res.accepted[0];
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all email`;
  }

  findOne(id: number) {
    return `This action returns a #${id} email`;
  }

  update(id: number, updateEmailDto: UpdateEmailDto) {
    return `This action updates a #${id} email`;
  }

  remove(id: number) {
    return `This action removes a #${id} email`;
  }
}

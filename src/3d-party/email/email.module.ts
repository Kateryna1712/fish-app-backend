import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateService } from './email-template.service.';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('GMAIL_HOST'),
          secure: false,
          port: configService.get('GMAIL_PORT'),
          logger: true,
          auth: {
            user: configService.get('GMAIL_USER'),
            pass: configService.get('GMAIL_PASS'),
          },
        },
      }),
    }),
  ],
  providers: [EmailService, EmailTemplateService],
  exports: [EmailService],
})
export class EmailModule {}

import { Injectable } from '@nestjs/common';
@Injectable()
export class EmailTemplateService {
  generateEmailConfirmationHtml(otpCode: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        .otp {
            display: inline-block;
            background-color: #f0f0f0;
            padding: 10px 20px;
            font-size: 20px;
            font-weight: bold;
            color: #4CAF50;
            border-radius: 4px;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #777777;
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            Email Verification
        </div>
        <div class="content">
            <p>Dear User,</p>
            <p>Thank you for signing up! To verify your email address, please use the following one-time password (OTP):</p>
            <div class="otp">${otpCode}</div>
            <p>This OTP is valid for the next 10 minutes. If you did not request this, please ignore this email.</p>
            <p>Best regards,<br>Your Company</p>
        </div>
        <div class="footer">
            &copy; 2025 Your Company. All rights reserved.
        </div>
    </div>
</body>
</html>

    `;
  }

  generateEmailResetPasswordHtml(otpCode: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #007BFF;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        .otp {
            display: inline-block;
            background-color: #f0f0f0;
            padding: 10px 20px;
            font-size: 20px;
            font-weight: bold;
            color: #007BFF;
            border-radius: 4px;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #777777;
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            Password Reset Request
        </div>
        <div class="content">
            <p>Dear User,</p>
            <p>We received a request to reset your password. Please use the following one-time password (OTP) to proceed:</p>
            <div class="otp">${otpCode}</div>
            <p>This OTP is valid for the next 10 minutes. If you did not request a password reset, please ignore this email or contact our support team.</p>
            <p>Best regards,<br>Your Company</p>
        </div>
        <div class="footer">
            &copy; 2025 Your Company. All rights reserved.
        </div>
    </div>
</body>
</html>`;
  }

  generateInvitationHtml(inviterName: string, inviteLink: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #28a745;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        .invite-link {
            display: inline-block;
            background-color: #007BFF;
            padding: 10px 20px;
            font-size: 16px;
            font-weight: bold;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #777777;
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            You're Invited to Join!
        </div>
        <div class="content">
            <p>Hi,</p>
            <p>${inviterName} has invited you to join an amazing platform. Click the link below to accept the invitation and start exploring:</p>
            <a class="invite-link" href="${inviteLink}" target="_blank">Accept Invitation</a>
            <p>If you have any questions, feel free to contact us.</p>
            <p>We can't wait to welcome you!</p>
            <p>Best regards,<br>Your Company</p>
        </div>
        <div class="footer">
            &copy; 2025 Your Company. All rights reserved.
        </div>
    </div>
</body>
</html>`;
  }
}

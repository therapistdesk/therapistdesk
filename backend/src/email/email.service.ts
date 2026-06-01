import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    auth: {
      user: 'd_dichev@yahoo.com',
      pass: 'zwjwbsnzvosujohi',
    },
  });

  // ✅ Verification email
  async sendVerificationEmail(to: string, code: string) {
    await this.transporter.sendMail({
      from: 'TherapistDesk <d_dichev@yahoo.com>',
      to,
      subject: 'Verify your email',
      text: `Your verification code is: ${code}`,
    });

    console.log(`📧 Verification email sent to ${to}`);
  }

  // ✅ Reminder (оставяме го, но по-унифициран)
  async sendReminder(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: 'TherapistDesk <d_dichev@yahoo.com>',
      to,
      subject,
      text,
    });

    console.log(`📧 Reminder email sent to ${to}`);
  }
}
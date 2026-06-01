import { Injectable } from '@nestjs/common';
import Twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: any | null = null;

  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    // 👉 ако няма валиден SID → не инициализираме клиента
    if (!sid || !sid.startsWith('AC') || !token) {
      console.log('SMS DISABLED (no valid Twilio credentials)');
      return;
    }

    this.client = Twilio(sid, token);
  }

  async sendSms(to: string, body: string) {
    if (!this.client) {
      console.log('SMS SKIPPED');
      return;
    }

    return this.client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  }
}
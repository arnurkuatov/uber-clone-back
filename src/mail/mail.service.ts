import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(@Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions) {

  }
  async sendEmail(subject: string, template: string, emailVars: EmailVar[]): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Arnur from Uber Eats <mailgun@${this.options.domain}>`);
    form.append('to', `arnurkuatov@gmail.com`);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));
    try {
     await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`,
      },
      body: form
    });
     return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify your Email', 'verify-email', [
      {key: 'code', value: code},
      {key: 'username', value: email}
    ])
  }
}

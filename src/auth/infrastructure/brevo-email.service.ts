import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BrevoEmailService {
  constructor(private readonly config: ConfigService) {}

  async sendResetCodeEmail(input: {
    email: string;
    code: string;
    nom?: string;
    prenom?: string;
  }) {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    const templateId = Number(this.config.get('BREVO_TEMPLATE_RESET_ID'));

    if (!apiKey || !templateId) {
      throw new InternalServerErrorException(
        'Configuration email manquante',
      );
    }

    const payload = {
      to: [{ email: input.email }],
      templateId,
      params: {
        code: input.code,
        nom: input.nom ?? '',
        prenom: input.prenom ?? '',
      },
    };

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new InternalServerErrorException(
        `Erreur envoi email (${res.status})`,
      );
    }
  }
}

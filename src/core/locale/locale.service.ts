import { Injectable } from '@nestjs/common';

import { I18nService } from 'nestjs-i18n';
import { I18nConstant } from '../constant/i18n.constant';

@Injectable()
export class LocaleService {
  static lang: string = I18nConstant.FALLBACK_LANGUAGE;

  constructor(private readonly i18n: I18nService) {}

  static setLang(lang: string) {
    this.lang = lang;
  }

  async translate(message: string, args?: any): Promise<string> {
    return this.i18n.translate(`message.${message}`, { args, lang: LocaleService.lang });
  }
}

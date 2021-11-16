import { ExecutionContext, Injectable } from '@nestjs/common';
import { pick } from 'accept-language-parser';
import { I18nResolver, I18nService } from 'nestjs-i18n';

import { HeaderConstant } from '../constant/header.constant';
import { JsonObject } from '../interface/json-object.interface';
import { LocaleService } from './locale.service';

@Injectable()
export class AcceptLanguageResolver implements I18nResolver {
  constructor(private readonly i18n: I18nService) {}

  async resolve(context: ExecutionContext): Promise<string | string[] | undefined> {
    const request: JsonObject = context.switchToHttp().getRequest();
    const requested: string = request.raw ? request.raw.headers?.[HeaderConstant.ACCEPT_LANGUAGE] : request?.headers?.[HeaderConstant.ACCEPT_LANGUAGE];

    if (requested) {
      const supportedLangs: Array<string> = await this.i18n.getSupportedLanguages();
      const selected: string = pick(supportedLangs, requested) ?? pick(supportedLangs, requested, { loose: true });

      LocaleService.setLang(selected);
      return selected;
    }

    LocaleService.setLang(requested);
    return requested;
  }
}

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { I18nJsonParser, I18nModule } from 'nestjs-i18n';
import * as path from 'path';

import { I18nConstant } from '../constant/i18n.constant';
import { AcceptLanguageResolver } from './accept-language.resolver';
import { ErrorTranslationInterceptor } from './error-translation.interceptor';
import { LocaleService } from './locale.service';

@Module({
  imports: [
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: I18nConstant.FALLBACK_LANGUAGE,
        fallbacks: {
          'en-*': 'en',
          'in-*': 'id',
          'id-*': 'id'
        },
        parserOptions: {
          path: path.resolve(`${__dirname}${I18nConstant.PATH}`)
        }
      }),
      parser: I18nJsonParser,
      resolvers: [AcceptLanguageResolver]
    })
  ],
  providers: [LocaleService, { provide: APP_INTERCEPTOR, useClass: ErrorTranslationInterceptor }],
  exports: [LocaleService]
})
export class LocaleModule {}

import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TranslateParams } from './translate-params.model';
import { LocaleService } from './locale.service';

@Injectable()
export class ErrorTranslationInterceptor implements NestInterceptor {
  constructor(private service: LocaleService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const { response, status } = error;

        if (!(response instanceof TranslateParams)) {
          throw error;
        }

        throw new HttpException(this.service.translate(response.message, response.args), status);
      })
    );
  }
}

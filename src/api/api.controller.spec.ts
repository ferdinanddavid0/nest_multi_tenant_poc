import { Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, createConnection } from 'typeorm';

import { CryptographyModule } from '../core/cryptography/cryptography.module';
import { JsonObject } from '../core/interface/json-object.interface';
import { LocaleModule } from '../core/locale/locale.module';
import { TenantConnection } from '../core/multi-tenant/multi-tenant.module';
import { ApiController } from './api.controller';
import { UserService } from './user.service';

describe('ApiController', () => {
  const OLD_ENV_VAR: any = process.env;
  let controller: ApiController;
  let connection: Connection;

  beforeEach(async () => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV_VAR,
      CATAPA_ENCRYPTION_CURRENTKEYID: 'K1',
      CATAPA_ENCRYPTION_KEYS_K0_PASSWORD: 'ejCJ2oRjUl1lYHhDjjdwuGO4keArFw1jX/gKhKluCz0=',
      CATAPA_ENCRYPTION_KEYS_K1_PASSWORD: 'EQaAyReOEzd2RqYx8X2fS4sMOvm557RhiS7HCjdXDxQ='
    };

    connection = await createConnection({ type: 'sqlite', database: ':memory:', synchronize: true });
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              encryption: {
                provider: 'env',
                env: {
                  prefix: 'CATAPA_ENCRYPTION_KEYS_',
                  suffix: '_PASSWORD'
                }
              }
            })
          ]
        }),
        LocaleModule,
        CryptographyModule
      ],
      providers: [
        { provide: TenantConnection, useValue: connection },
        { provide: UserService, useClass: UserService, scope: Scope.DEFAULT }
      ]
    }).compile();

    controller = module.get<ApiController>(ApiController);
  });

  afterEach(async () => {
    await connection.close();
  });

  afterAll(() => {
    process.env = OLD_ENV_VAR;
  });

  describe('/', () => {
    it('should return json object properly', async () => {
      const actual: JsonObject = await controller.getIndex();
      expect(actual).toEqual({ message: 'Halo!' });
    });
  });
});

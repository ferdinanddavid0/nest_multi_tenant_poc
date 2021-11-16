import { EncryptionAlgorithmSpec, KMSClient } from '@aws-sdk/client-kms';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AwsKmsKeychainService } from './aws-kms-keychain.service';
import { EnvironmentVariableKeychainService } from './environment-variable-keychain.service';

import { KeychainService } from './keychain.service';

jest.mock('@aws-sdk/client-kms');

describe('KeychainService', () => {
  const OLD_ENV_VAR: any = process.env;

  describe('EnvironmentVariableKeychainService', () => {
    let service: KeychainService;

    beforeEach(async () => {
      jest.resetModules();
      process.env = {
        ...OLD_ENV_VAR,
        CATAPA_ENCRYPTION_CURRENTKEYID: 'K0',
        CATAPA_ENCRYPTION_KEYS_K0_PASSWORD: 'ejCJ2oRjUl1lYHhDjjdwuGO4keArFw1jX/gKhKluCz0=',
        CATAPA_ENCRYPTION_KEYS_K1_PASSWORD: 'EQaAyReOEzd2RqYx8X2fS4sMOvm557RhiS7HCjdXDxQ=',
        CATAPA_ENCRYPTION_KEYS_K2_PASSWORD: '6S/jMdFcGxGKqLFk/d0f14k/NOW9N/Piqkd8sTKqcG4='
      };

      const module: TestingModule = await Test.createTestingModule({
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
          })
        ],
        providers: [{ provide: KeychainService, useClass: EnvironmentVariableKeychainService }]
      }).compile();

      service = module.get<KeychainService>(KeychainService);
    });

    afterAll(() => {
      process.env = OLD_ENV_VAR;
    });

    it('should load environment variable properly', async () => {
      await service.loadKeys();

      const keyK0: Buffer = await service.keyWithIdentifier('K0');
      expect(keyK0.toString('hex')).toEqual('7a3089da8463525d656078438e3770b863b891e02b170d635ff80a84a96e0b3d');

      const keyK1: Buffer = await service.keyWithIdentifier('K1');
      expect(keyK1.toString('hex')).toEqual('110680c9178e13377646a631f17d9f4b8b0c3af9b9e7b461892ec70a37570f14');

      const keyK2: Buffer = await service.keyWithIdentifier('K2');
      expect(keyK2.toString('hex')).toEqual('e92fe331d15c1b118aa8b164fddd1fd7893f34e5bd37f3e2aa477cb132aa706e');
    });

    it('should return `undefined` on invalid key', async () => {
      await service.loadKeys();

      const invalidKey: Buffer = await service.keyWithIdentifier('INVALID');
      expect(invalidKey).toBe(undefined);
    });
  });

  describe('AwsKmsKeychainService', () => {
    let service: KeychainService;

    beforeEach(async () => {
      jest.resetModules();
      (KMSClient as any).mockClear();
      (KMSClient as any).mockImplementation(() => ({
        send: () =>
          Promise.resolve({
            KeyId: 'arn:aws:kms:ap-southeast-1:1234567890:key/265ec459-643d-4337-b7f1-71d6c2e065d8',
            Plaintext: Uint8Array.from([0xfa, 0xef, 0xda, 0x4b, 0x2d, 0x92, 0x0a, 0x83, 0x16, 0x2e, 0x6f, 0x50, 0xdb, 0x90, 0x29, 0xfb]),
            EncryptionAlgorithm: EncryptionAlgorithmSpec.RSAES_OAEP_SHA_256
          })
      }));

      process.env = {
        ...OLD_ENV_VAR,
        AWS_ACCESS_KEY_ID: 'AWSACCESSKEYEXMP',
        AWS_SECRET_ACCESS_KEY: 'AWSSECRETKEYEXMP',
        CATAPA_ENCRYPTION_CURRENTKEYID: 'K0',
        CATAPA_ENCRYPTION_KEYS_K0_PASSWORD: 'BeXxXg9MsDKdexiAqQlaBrJqeKZfjy6+YaumFbOtEow='
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              () => ({
                encryption: {
                  provider: 'kms',
                  env: {
                    prefix: 'CATAPA_ENCRYPTION_KEYS_',
                    suffix: '_PASSWORD'
                  },
                  kms: {
                    config: {
                      region: 'ap-southeast-1'
                    },
                    keyId: null
                  }
                }
              })
            ]
          })
        ],
        providers: [{ provide: KeychainService, useClass: AwsKmsKeychainService }]
      }).compile();

      service = module.get<KeychainService>(KeychainService);
    });

    afterAll(() => {
      process.env = OLD_ENV_VAR;
    });

    it('should load keys properly', async () => {
      await service.loadKeys();

      const keyK0: Buffer = await service.keyWithIdentifier('K0');
      expect(keyK0.toString('hex')).toEqual('faefda4b2d920a83162e6f50db9029fb');
    });

    it('should return `undefined` on invalid key', async () => {
      await service.loadKeys();

      const invalidKey: Buffer = await service.keyWithIdentifier('INVALID');
      expect(invalidKey).toBe(undefined);
    });
  });
});

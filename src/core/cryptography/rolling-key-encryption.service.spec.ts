import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentVariableKeychainService } from './keychain/environment-variable-keychain.service';
import { KeychainService } from './keychain/keychain.service';
import { RollingKeyEncryptionService } from './rolling-key-encryption.service';
import { CURRENT_KEY_ID } from './shared/current-key-id.token';
import { EncryptedData } from './shared/encrypted-data.model';
import { AES256CTREncryptionService } from './symmetric/aes-256-ctr-encryption.service';
import { SymmentricKeyEncryptionService } from './symmetric/symmentric-key-encryption.service';

jest.mock('@aws-sdk/client-kms');

describe('RollingKeyEncryptionService', () => {
  const OLD_ENV_VAR: any = process.env;
  let service: RollingKeyEncryptionService;

  beforeEach(async () => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV_VAR,
      CATAPA_ENCRYPTION_CURRENTKEYID: 'K1',
      CATAPA_ENCRYPTION_KEYS_K0_PASSWORD: 'ejCJ2oRjUl1lYHhDjjdwuGO4keArFw1jX/gKhKluCz0=',
      CATAPA_ENCRYPTION_KEYS_K1_PASSWORD: 'EQaAyReOEzd2RqYx8X2fS4sMOvm557RhiS7HCjdXDxQ='
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
      providers: [
        RollingKeyEncryptionService,
        { provide: CURRENT_KEY_ID, useValue: 'K1' },
        { provide: KeychainService, useClass: EnvironmentVariableKeychainService },
        { provide: SymmentricKeyEncryptionService, useClass: AES256CTREncryptionService }
      ]
    }).compile();

    await module.get<KeychainService>(KeychainService).loadKeys();
    service = module.get<RollingKeyEncryptionService>(RollingKeyEncryptionService);
  });

  afterAll(() => {
    process.env = OLD_ENV_VAR;
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should decrypt with proper key (K0)', async () => {
    const cipher: EncryptedData = EncryptedData.fromBase64(
      'Q+uY2UabwpwsQX10HzNxFQ==$PatP+OybDrW0mF4o6IVEBcI0ELgpMiUyZdkMK2CT0Rk=$kuPrTzN3NmyZcCW0rniQirobuCrY$eyJrIjoiSzAiLCJ2IjoiMSJ9'
    );
    expect(cipher.metadata.get('k')).toEqual('K0');

    const plain: Buffer = await service.decrypt(cipher);
    expect(plain.toString('utf-8')).toEqual('Lorem ipsum sit dolor');
  });

  it('should attempt to use current key (K1) if no key is specified', async () => {
    const cipher: EncryptedData = EncryptedData.fromBase64(
      'iEwUz/7IMXi8Q88Lau1+AA==$qTboIYvsdtwoOtj2Ahad0YtahQ1H4iQqS+pErQj4W8E=$nZaa/q9lrYsrN/4RRhHic0d2hmO7$eyJ2IjoiMSJ9'
    );
    expect(cipher.metadata.get('k')).toBeFalsy();
    const plain: Buffer = await service.decrypt(cipher);

    expect(plain.toString('utf-8')).toEqual('Lorem ipsum sit dolor');
  });

  it('should roll encryption key properly (K0 to K1)', async () => {
    const cipher: EncryptedData = EncryptedData.fromBase64(
      'Q+uY2UabwpwsQX10HzNxFQ==$PatP+OybDrW0mF4o6IVEBcI0ELgpMiUyZdkMK2CT0Rk=$kuPrTzN3NmyZcCW0rniQirobuCrY$eyJrIjoiSzAiLCJ2IjoiMSJ9'
    );
    expect(cipher.metadata.get('k')).toEqual('K0');

    const plain: Buffer = await service.decrypt(cipher);

    expect(plain.toString('utf-8')).toEqual('Lorem ipsum sit dolor');

    const newCipher: EncryptedData = await service.encrypt(plain);
    expect(newCipher.salt).toBeTruthy();
    expect(newCipher.content).toBeTruthy();
    expect(newCipher.metadata.get('k')).toEqual('K1');
  });

  it('should throw error on invalid cipher data', async () => {
    const cipher: EncryptedData = EncryptedData.fromBase64(
      'Q+uY2Uabwpws0HzNxFQ==$PatP+OybDrW0mF4o6IVEI0ELgpMiUyZdkMK2CT0Rk=$kuPrTzN3NmyZcCW0rniQirobuCrY$eyJrIjoiSzAiLCJ2IjoiMSJ9'
    );

    expect(cipher.metadata.get('k')).toEqual('K0');
    await expect(service.decrypt(cipher)).rejects.toThrow();
  });
});

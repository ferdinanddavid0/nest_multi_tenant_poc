import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HmacService } from './hmac/hmac.service';
import { CURRENT_KEY_ID } from './shared/current-key-id.token';
import { HashAlgorithm } from './shared/hash-algorithm.enum';
import { HashService } from './hash/hash.service';
import { EnvironmentVariableKeychainService } from './keychain/environment-variable-keychain.service';
import { KeychainService } from './keychain/keychain.service';
import { RollingKeyEncryptionService } from './rolling-key-encryption.service';
import { KeyGeneratorService } from './shared/key-generator.service';
import { AES256CTREncryptionService } from './symmetric/aes-256-ctr-encryption.service';
import { SymmentricKeyEncryptionService } from './symmetric/symmentric-key-encryption.service';

@Module({
  providers: [
    KeyGeneratorService,
    RollingKeyEncryptionService,
    { provide: SymmentricKeyEncryptionService, useClass: AES256CTREncryptionService },
    { provide: KeychainService, useClass: EnvironmentVariableKeychainService },
    { provide: HashService, useFactory: () => new HashService(HashAlgorithm.SHA256) },
    { provide: HmacService, useFactory: () => new HmacService(HashAlgorithm.SHA256) },
    { provide: CURRENT_KEY_ID, useFactory: (config: ConfigService) => config.get<string>('encryption.currentKeyId'), inject: [ConfigService] }
  ],
  exports: [KeyGeneratorService, KeychainService, RollingKeyEncryptionService, SymmentricKeyEncryptionService, HashService, HmacService]
})
export class CryptographyModule implements OnModuleInit {
  constructor(private readonly keychain: KeychainService) {}

  async onModuleInit(): Promise<void> {
    await this.keychain.loadKeys();
  }
}

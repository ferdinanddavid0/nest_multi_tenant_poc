import { Inject, Injectable } from '@nestjs/common';

import { CURRENT_KEY_ID } from './shared/current-key-id.token';
import { EncryptedData } from './shared/encrypted-data.model';
import { KeychainService } from './keychain/keychain.service';
import { SymmentricKeyEncryptionService } from './symmetric/symmentric-key-encryption.service';

@Injectable()
export class RollingKeyEncryptionService {
  protected readonly METADATA_ENCRYPTION_KEY: string = 'k';

  constructor(
    @Inject(CURRENT_KEY_ID) private readonly currentKeyId: string,
    private readonly keychain: KeychainService,
    private readonly cipher: SymmentricKeyEncryptionService
  ) {}

  async decrypt(data: EncryptedData): Promise<Buffer> {
    const keyId: string = data.metadata.get(this.METADATA_ENCRYPTION_KEY) ?? this.currentKeyId;
    const key: Buffer = await this.keychain.keyWithIdentifier(keyId);
    console.log(key);
    return this.cipher.decrypt(data, key);
  }

  async encrypt(plain: Buffer): Promise<EncryptedData> {
    const key: Buffer = await this.keychain.keyWithIdentifier(this.currentKeyId);
    const encrypted: EncryptedData = await this.cipher.encrypt(plain, key);
    console.log(key);

    encrypted.metadata.set(this.METADATA_ENCRYPTION_KEY, this.currentKeyId);

    return encrypted;
  }
}

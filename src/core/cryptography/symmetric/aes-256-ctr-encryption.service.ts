import { Injectable } from '@nestjs/common';
import { Cipher, createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

import { EncryptedData } from '../shared/encrypted-data.model';
import { SymmentricKeyEncryptionService } from './symmentric-key-encryption.service';
import { SymmetricKeyAlgorithmEnum } from './symmetric-key-algorithm.enum';

@Injectable()
export class AES256CTREncryptionService extends SymmentricKeyEncryptionService {
  protected readonly algorithm: SymmetricKeyAlgorithmEnum = SymmetricKeyAlgorithmEnum.AES_256_CTR;
  protected readonly keySize: number = 32; // 256bit
  protected readonly ivSize: number = 16; // 128bit

  async encrypt(plain: Buffer, key: Buffer): Promise<EncryptedData> {
    const iv: Buffer = randomBytes(this.ivSize);
    const salt: Buffer = randomBytes(this.keySize);

    const cipherKey: Buffer = scryptSync(key, salt, this.keySize);
    const cipher: Cipher = createCipheriv(this.algorithm, cipherKey, iv);

    const result: Buffer = Buffer.concat([cipher.update(plain), cipher.final()]);

    return Promise.resolve(new EncryptedData(result, salt, iv));
  }

  async decrypt(data: EncryptedData, key: Buffer): Promise<Buffer> {
    const iv: Buffer = data.iv;
    const salt: Buffer = data.salt;
    const content: Buffer = data.content;

    const cipherKey: Buffer = scryptSync(key, salt, this.keySize);
    const cipher: Cipher = createDecipheriv(this.algorithm, cipherKey, iv);

    const result: Buffer = Buffer.concat([cipher.update(content), cipher.final()]);

    return Promise.resolve(result);
  }
}

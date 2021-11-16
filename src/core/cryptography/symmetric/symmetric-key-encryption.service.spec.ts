import { randomBytes } from 'crypto';

import { EncryptedData } from '../shared/encrypted-data.model';
import { AES256CTREncryptionService } from './aes-256-ctr-encryption.service';
import { SymmentricKeyEncryptionService } from './symmentric-key-encryption.service';

describe('SymmetricKeyEncryptionService', () => {
  describe('AES256CTREncryptionService', () => {
    function setup(): SymmentricKeyEncryptionService {
      return new AES256CTREncryptionService();
    }

    it('should properly encrypt and decrypt small data', async () => {
      const service: SymmentricKeyEncryptionService = setup();
      const plainText: string = 'Lorem Ipsum Sit Dolor Amet';
      const key: Buffer = Buffer.from(randomBytes(32));

      const encrypted: EncryptedData = await service.encrypt(Buffer.from(plainText, 'utf-8'), key);
      const decrypted: Buffer = await service.decrypt(encrypted, key);
      const decryptedText: string = decrypted.toString('utf-8');

      expect(decryptedText).toEqual(plainText);
    });

    it('should properly encrypt and decrypt small data with large key', async () => {
      const service: SymmentricKeyEncryptionService = setup();
      const plainText: string = 'Lorem Ipsum Sit Dolor Amet';
      const key: Buffer = Buffer.from(randomBytes(1024));

      const encrypted: EncryptedData = await service.encrypt(Buffer.from(plainText, 'utf-8'), key);
      const decrypted: Buffer = await service.decrypt(encrypted, key);
      const decryptedText: string = decrypted.toString('utf-8');

      expect(decryptedText).toEqual(plainText);
    });

    it('should properly encrypt and decrypt large data', async () => {
      const service: SymmentricKeyEncryptionService = setup();
      const plainData: Buffer = Buffer.from(randomBytes(4096));
      const key: Buffer = Buffer.from(randomBytes(32));

      const encrypted: EncryptedData = await service.encrypt(plainData, key);
      const decrypted: Buffer = await service.decrypt(encrypted, key);

      expect(decrypted).toEqual(plainData);
    });
  });
});

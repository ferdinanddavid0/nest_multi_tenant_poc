import { Injectable } from '@nestjs/common';

import { EncryptedData } from '../shared/encrypted-data.model';

@Injectable()
export abstract class SymmentricKeyEncryptionService {
  abstract encrypt(plain: Buffer, key: Buffer): Promise<EncryptedData>;
  abstract decrypt(data: EncryptedData, key: Buffer): Promise<Buffer>;
}

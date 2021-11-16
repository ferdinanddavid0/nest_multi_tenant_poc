import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class KeychainService {
  abstract loadKeys(): Promise<void>;
  abstract keyWithIdentifier(id: string): Promise<Buffer>;
}

import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CryptoKey {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export class SymmetricKey extends Buffer implements CryptoKey {}

export interface AsymmetricKey extends CryptoKey {
  privateKey: Buffer;
  publicKey: Buffer;
}

@Injectable()
export class KeyGeneratorService {
  generateBytes(length: number): Buffer {
    return randomBytes(length);
  }

  generateKey(length: number = 32): SymmetricKey {
    return this.generateBytes(length);
  }
}

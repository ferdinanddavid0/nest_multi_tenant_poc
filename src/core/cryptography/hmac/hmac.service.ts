import { createHmac, Hmac } from 'crypto';

import { HashAlgorithm } from '../shared/hash-algorithm.enum';

export class HmacService {
  constructor(public readonly algorithm: HashAlgorithm) {}

  static create(algorithm: HashAlgorithm): HmacService {
    return new HmacService(algorithm);
  }

  digest(plain: Buffer, secret: Buffer): Buffer {
    const hmac: Hmac = createHmac(this.algorithm, secret);
    return hmac.update(plain).digest();
  }
}

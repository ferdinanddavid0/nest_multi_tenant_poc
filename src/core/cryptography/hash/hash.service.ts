import { createHash, Hash } from 'crypto';

import { HashAlgorithm } from '../shared/hash-algorithm.enum';

export class HashService {
  constructor(public readonly algorithm: HashAlgorithm) {}

  static create(algorithm: HashAlgorithm): HashService {
    return new HashService(algorithm);
  }

  digest(plain: Buffer): Buffer {
    const hash: Hash = createHash(this.algorithm);
    return hash.update(plain).digest();
  }
}

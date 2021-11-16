import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { KeychainService } from './keychain.service';
import { KeyRing } from './keyring.interface';

@Injectable()
export class EnvironmentVariableKeychainService extends KeychainService {
  protected readonly KEY_PATTERN_PREFIX: string;
  protected readonly KEY_PATTERN_SUFFIX: string;

  private envKeyring: KeyRing<Buffer> = {};

  constructor(protected readonly config: ConfigService) {
    super();

    const { prefix, suffix } = this.config.get('encryption.env');
    this.KEY_PATTERN_PREFIX = prefix;
    this.KEY_PATTERN_SUFFIX = suffix;
  }

  public async loadKeys(): Promise<void> {
    return new Promise((resolve) => {
      this.envKeyring = this.loadKeysFromEnvVar();
      resolve();
    });
  }

  public async keyWithIdentifier(id: string): Promise<Buffer> {
    return this.envKeyring[id];
  }

  protected loadKeysFromEnvVar(): KeyRing<Buffer> {
    const env: { [key: string]: string } = process.env;
    const prefixLength: number = this.KEY_PATTERN_PREFIX.length;
    const suffixLength: number = this.KEY_PATTERN_SUFFIX.length;

    const keyring: KeyRing<Buffer> = {};

    Object.keys(env)
      .filter((key: string) => key.startsWith(this.KEY_PATTERN_PREFIX) && key.endsWith(this.KEY_PATTERN_SUFFIX))
      .map((key: string) => key.substring(prefixLength).slice(0, -suffixLength))
      .forEach((keyId: string) => {
        keyring[keyId] = Buffer.from(env[`${this.KEY_PATTERN_PREFIX}${keyId}${this.KEY_PATTERN_SUFFIX}`], 'base64');
      });
    console.log(keyring);
    return keyring;
  }
}

import { DecryptCommand, DecryptResponse, KMSClient, KMSClientConfig } from '@aws-sdk/client-kms';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvironmentVariableKeychainService } from './environment-variable-keychain.service';
import { KeyRing } from './keyring.interface';

@Injectable()
export class AwsKmsKeychainService extends EnvironmentVariableKeychainService {
  private client: KMSClient;
  private awsKeyring: KeyRing<Buffer> = {};

  constructor(config: ConfigService) {
    super(config);

    const kmsConfig: Partial<KMSClientConfig> = this.config.get<Partial<KMSClientConfig>>('encryption.kms.config');
    this.client = new KMSClient(kmsConfig);
  }

  public async loadKeys(): Promise<void> {
    let envKeyring: KeyRing<Buffer> = this.loadKeysFromEnvVar();

    const keyIds: Array<string> = Object.keys(envKeyring);
    for (const keyId of keyIds) {
      const command: DecryptCommand = new DecryptCommand({ CiphertextBlob: envKeyring[keyId] });
      const response: DecryptResponse = await this.client.send(command);

      this.awsKeyring[keyId] = Buffer.from(response.Plaintext);

      // clear encrypted value
      envKeyring[keyId] = null;
    }

    // dispose after use
    envKeyring = null;
  }

  public async keyWithIdentifier(id: string): Promise<Buffer> {
    return this.awsKeyring[id];
  }
}

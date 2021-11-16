import { Metadata } from '../../model/metadata.model';

export class EncryptedData {
  private static readonly VALUE_SEPARATOR: string = '$';

  public readonly metadata: Metadata = new Metadata();

  constructor(public readonly content: Buffer, public readonly salt: Buffer, public readonly iv: Buffer) {}

  private static from(value: string, encoding: BufferEncoding): EncryptedData {
    const [iv, salt, content, metadata] = value.split(this.VALUE_SEPARATOR);
    const result: EncryptedData = new EncryptedData(Buffer.from(content, encoding), Buffer.from(salt, encoding), Buffer.from(iv, encoding));
    result.metadata.deserialize(metadata);

    return result;
  }

  static fromBase64(value: string): EncryptedData {
    return EncryptedData.from(value, 'base64');
  }

  static fromHex(value: string): EncryptedData {
    return EncryptedData.from(value, 'hex');
  }

  private convertTo(encoding: BufferEncoding): string {
    return [this.iv.toString(encoding), this.salt.toString(encoding), this.content.toString(encoding), this.metadata.serialize()].join(
      EncryptedData.VALUE_SEPARATOR
    );
  }

  toBase64(): string {
    return this.convertTo('base64');
  }

  toHex(): string {
    return this.convertTo('hex');
  }
}

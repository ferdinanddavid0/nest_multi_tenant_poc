import { randomBytes } from 'crypto';
import { EncryptedData } from './encrypted-data.model';

describe('EncryptedDataModel', () => {
  it('should properly construct data with param', () => {
    const content: Buffer = randomBytes(4);
    const salt: Buffer = randomBytes(4);
    const iv: Buffer = randomBytes(4);
    const model: EncryptedData = new EncryptedData(content, salt, iv);

    expect(model.content).toEqual(content);
    expect(model.salt).toEqual(salt);
    expect(model.iv).toEqual(iv);
  });

  describe('Base64', () => {
    it('should serialize to base64 properly', () => {
      const content: Buffer = Buffer.from([0x2f, 0x96, 0x7a, 0x6f, 0xfb, 0xaf, 0xfa, 0x6b]);
      const salt: Buffer = Buffer.from([0x22, 0x78, 0x13, 0x33]);
      const iv: Buffer = Buffer.from([0x3c, 0xb6, 0xb3, 0x25]);
      const expected: string = 'PLazJQ==$IngTMw==$L5Z6b/uv+ms=$eyJ2IjoiMSJ9';

      const model: EncryptedData = new EncryptedData(content, salt, iv);

      const actual: string = model.toBase64();
      expect(actual).toEqual(expected);
    });

    it('should deserialize from base64 properly', () => {
      const input: string = 'PLazJQ==$IngTMw==$L5Z6b/uv+ms=$eyJ2IjoiMSJ9';
      const content: Buffer = Buffer.from([0x2f, 0x96, 0x7a, 0x6f, 0xfb, 0xaf, 0xfa, 0x6b]);
      const salt: Buffer = Buffer.from([0x22, 0x78, 0x13, 0x33]);
      const iv: Buffer = Buffer.from([0x3c, 0xb6, 0xb3, 0x25]);

      const model: EncryptedData = EncryptedData.fromBase64(input);

      expect(model.content).toEqual(content);
      expect(model.salt).toEqual(salt);
      expect(model.iv).toEqual(iv);
    });
  });

  describe('Hex', () => {
    it('should serialize to hex properly', () => {
      const content: Buffer = Buffer.from([0x2f, 0x96, 0x7a, 0x6f, 0xfb, 0xaf, 0xfa, 0x6b]);
      const salt: Buffer = Buffer.from([0x22, 0x78, 0x13, 0x33]);
      const iv: Buffer = Buffer.from([0x3c, 0xb6, 0xb3, 0x25]);
      const expected: string = '3cb6b325$22781333$2f967a6ffbaffa6b$eyJ2IjoiMSJ9';

      const model: EncryptedData = new EncryptedData(content, salt, iv);

      const actual: string = model.toHex();
      expect(actual).toEqual(expected);
    });

    it('should deserialize from hex properly', () => {
      const input: string = '3cb6b325$22781333$2f967a6ffbaffa6b$eyJ2IjoiMSJ9';
      const content: Buffer = Buffer.from([0x2f, 0x96, 0x7a, 0x6f, 0xfb, 0xaf, 0xfa, 0x6b]);
      const salt: Buffer = Buffer.from([0x22, 0x78, 0x13, 0x33]);
      const iv: Buffer = Buffer.from([0x3c, 0xb6, 0xb3, 0x25]);

      const model: EncryptedData = EncryptedData.fromHex(input);

      expect(model.content).toEqual(content);
      expect(model.salt).toEqual(salt);
      expect(model.iv).toEqual(iv);
    });
  });

  describe('Metadata', () => {
    it('should append metadata properly', () => {
      const content: Buffer = Buffer.from([0x2f, 0x96, 0x7a, 0x6f, 0xfb, 0xaf, 0xfa, 0x6b]);
      const salt: Buffer = Buffer.from([0x22, 0x78, 0x13, 0x33]);
      const iv: Buffer = Buffer.from([0x3c, 0xb6, 0xb3, 0x25]);
      const expected: string = 'PLazJQ==$IngTMw==$L5Z6b/uv+ms=$eyJrZXkiOiJLMDEiLCJzZXAiOiIkIiwidiI6IjEifQ==';

      const model: EncryptedData = new EncryptedData(content, salt, iv);
      model.metadata.set('key', 'K01');
      model.metadata.set('sep', '$');

      const actual: string = model.toBase64();
      expect(actual).toEqual(expected);
    });

    it('should deserialize with metadata properly', () => {
      const input: string = 'PLazJQ==$IngTMw==$L5Z6b/uv+ms=$eyJrZXkiOiJLMDEiLCJzZXAiOiIkIiwidiI6IjEifQ==';
      const content: Buffer = Buffer.from([0x2f, 0x96, 0x7a, 0x6f, 0xfb, 0xaf, 0xfa, 0x6b]);
      const salt: Buffer = Buffer.from([0x22, 0x78, 0x13, 0x33]);
      const iv: Buffer = Buffer.from([0x3c, 0xb6, 0xb3, 0x25]);

      const model: EncryptedData = EncryptedData.fromBase64(input);

      expect(model.metadata.get('key')).toEqual('K01');
      expect(model.metadata.get('sep')).toEqual('$');
      expect(model.content).toEqual(content);
      expect(model.salt).toEqual(salt);
      expect(model.iv).toEqual(iv);
    });
  });
});

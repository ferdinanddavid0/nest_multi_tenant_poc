import { WithProperties } from '../interface/with-properties.interface';

export type MetaMap<K extends string, V> = {
  [key in K]: V;
};

export type VersionedMetaMap<K extends string, V> = MetaMap<K, V> & WithProperties<{ v: V }>;

export class Metadata {
  private static readonly SERIALIZATION_ENCODING: BufferEncoding = 'base64';

  private readonly map: VersionedMetaMap<string, string>;

  constructor(initial: MetaMap<string, string> = null) {
    this.map = { v: '1', ...initial };
  }

  set(key: string, value: string) {
    this.map[key] = value;
  }

  get(key: string): string {
    return this.map[key];
  }

  remove(key: string) {
    delete this.map[key];
  }

  deserialize(serialized: string): Metadata {
    const raw: string = Buffer.from(serialized ?? '', Metadata.SERIALIZATION_ENCODING).toString();

    let parsed: MetaMap<string, string>;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      parsed = {};
    }
    const sanitized: MetaMap<string, string> = this.sanitize(parsed);

    Object.keys(sanitized).forEach((key: string) => this.set(key, sanitized[key]));

    return this;
  }

  serialize(): string {
    const target: MetaMap<string, string> = this.sanitize(this.map);
    return Buffer.from(JSON.stringify(target)).toString(Metadata.SERIALIZATION_ENCODING);
  }

  protected sanitize(input: MetaMap<string, string>): MetaMap<string, string> {
    const result: MetaMap<string, string> = {};
    Object.keys(input)
      .sort()
      .filter((key: string) => input[key] != null)
      .forEach((key: string) => (result[key] = input[key]));

    return result;
  }
}

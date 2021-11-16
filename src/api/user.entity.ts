import { Injectable } from '@nestjs/common';
import { Column, Connection, Entity, EventSubscriber, PrimaryGeneratedColumn } from 'typeorm';

import { HashService } from '../core/cryptography/hash/hash.service';
import { RollingKeyEncryptionService } from '../core/cryptography/rolling-key-encryption.service';
import { EncryptedData } from '../core/cryptography/shared/encrypted-data.model';
import { EntityEventSubscriber } from '../database/subscriber/entity-event.subscriber';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;
}

@Injectable()
@EventSubscriber()
export class UserEntityEventSubscriber extends EntityEventSubscriber<User> {
  protected readonly type: any = User;

  constructor(connection: Connection, private readonly hash: HashService, private readonly cipherSuite: RollingKeyEncryptionService) {
    super(connection);
  }

  async from(entity: User): Promise<User> {
    const encrypted: EncryptedData = EncryptedData.fromBase64(entity.password);
    const plain: Buffer = await this.cipherSuite.decrypt(encrypted);

    entity.password = plain.toString('hex');
    console.log('Plain PW: ', entity.password);
    return entity;
  }

  async to(entity: User): Promise<User> {
    const plain: Buffer = Buffer.from(entity.password, 'utf-8');
    const hashed: Buffer = this.hash.digest(plain);
    const encrypted: EncryptedData = await this.cipherSuite.encrypt(hashed);
    entity.password = encrypted.toBase64();

    console.log('encrypted PW:', entity.password);
    return entity;
  }
}

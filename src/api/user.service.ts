import { Injectable } from '@nestjs/common';
import { DeepPartial, FindConditions, FindManyOptions, FindOneOptions, Repository, UpdateResult } from 'typeorm';

import { TenantService } from '../core/multi-tenant/multi-tenant-service.decorator';
import { TenantConnection } from '../core/multi-tenant/multi-tenant.module';
import { User } from './user.entity';

@Injectable()
export abstract class TenantModelService<Entity> {
  protected abstract readonly type: any;

  protected constructor(protected readonly connection: TenantConnection) {}

  get repository(): Repository<Entity> {
    return this.connection.getRepository<Entity>(this.type);
  }

  async create(entity: DeepPartial<Entity>): Promise<Entity> {
    console.log('creating user');
    return this.repository.create(entity);
  }

  async save(entity: DeepPartial<Entity>): Promise<Entity> {
    console.log('user', entity, 'saved');
    return this.repository.save(entity);
  }

  async update(criteria: FindConditions<Entity>, partialEntity: DeepPartial<Entity>): Promise<UpdateResult> {
    return this.repository.update(criteria, partialEntity);
  }

  async find(conditions?: FindManyOptions<Entity>): Promise<Array<Entity>> {
    return this.repository.find(conditions);
  }

  async findOne(conditions?: FindOneOptions<Entity>): Promise<Entity | undefined> {
    return this.repository.findOne(conditions);
  }
}

@TenantService()
export class UserService extends TenantModelService<User> {
  protected readonly type: any = User;

  constructor(connection: TenantConnection) {
    super(connection);
  }
}

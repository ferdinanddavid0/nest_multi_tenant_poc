import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';

import { Connection, createConnection, EntityManager, getConnection, Repository } from 'typeorm';

import { TypeOrmConfig } from '../../config/typeorm.config';
import { CreateTenantDto } from './create-tenant.dto';
import { Tenant } from './tenant.entity';

export class MultiTenantService {
  constructor(
    private connection: Connection,
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(Tenant) private repository: Repository<Tenant>,
    private typeOrmConfig: TypeOrmConfig
  ) {}

  findAll(): Promise<Tenant[]> {
    return this.repository.find();
  }

  findByTenantName(name: string): Promise<Tenant | undefined> {
    return this.repository.findOne({ where: { name } });
  }

  async create(data: CreateTenantDto): Promise<Tenant> {
    const tenant = this.repository.create(data);

    try {
      const created = await this.repository.save(tenant);
      await this.entityManager.query(`CREATE SCHEMA ${created.name}`);
      await this.resolveTenantConnection(created);
      return created;
    } catch (e) {
      console.log(e);
    }
  }

  async resolveTenantConnection(tenant: Tenant): Promise<Connection> {
    let tenantConnection: Connection;

    try {
      tenantConnection = getConnection(tenant.name);
    } catch (e) {
      // console.log(e);
      console.log(`Establishing connection for tenant ${tenant.name}...`);
      tenantConnection = await createConnection(this.typeOrmConfig.getTenantConfig(tenant.name));
      tenantConnection.subscribers.push(...this.connection.subscribers);
      console.log(`Connection successfully established for tenant ${tenant.name}.`);
    } finally {
      return tenantConnection;
    }
  }
}

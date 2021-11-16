import { MiddlewareConsumer, Module, OnModuleInit, Scope } from '@nestjs/common';
import { NestModule } from '@nestjs/common/interfaces/modules/nest-module.interface';
import { REQUEST } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnection } from 'typeorm';

import { TypeOrmConfig, TypeOrmConfigModule } from '../../config/typeorm.config';
import { MultiTenantMiddleware } from './multi-tenant.middleware';
import { MultiTenantService } from './multi-tenant.service';
import { Tenant } from './tenant.entity';

export async function provideTenantConnection(request, connection) {
  const tenant: Tenant = await connection.getRepository(Tenant).findOne({ where: { name: request.headers.tenant } });
  return getConnection(tenant.name);
}
export class TenantConnection extends Connection {}

@Module({
  imports: [TypeOrmConfigModule, TypeOrmModule.forFeature([Tenant])],
  providers: [
    {
      provide: TenantConnection,
      inject: [REQUEST, Connection],
      scope: Scope.REQUEST,
      useFactory: provideTenantConnection
    },
    MultiTenantService
  ],
  exports: [TenantConnection, MultiTenantService]
})
export class MultiTenantModule implements NestModule, OnModuleInit {
  constructor(private service: MultiTenantService) {}

  async onModuleInit(): Promise<void> {
    const tenants: Array<Tenant> = await this.service.findAll();

    for (const tenant of tenants) {
      console.log(`MultiTenantModule.onModuleInit(migrate:${tenant.name})`);
      // Migrations are run when the connection is opened because of `migrationsRun: true` in connection option
      // await createConnection(this.typeOrmConfig.getTenantConfig(tenant.name));
    }
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MultiTenantMiddleware).forRoutes('*');
  }
}

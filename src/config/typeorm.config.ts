import { Injectable, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { ConnectionOptions } from 'typeorm';
import * as path from 'path';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const configuration: Partial<ConnectionOptions> = this.config.get<Partial<ConnectionOptions>>('database');

    return {
      ...configuration,
      entities: [path.resolve(`${__dirname}/../**/*.entity.{ts,js}`)],
      migrationsRun: true,
      migrations: [path.resolve(`${__dirname}/../database/migration/*.{ts,js}`)]
    };
  }

  getTenantConfig(name: string): ConnectionOptions {
    const configuration = this.config.get('database');
    //
    // const { type, host, port, username, password, synchronize } = configuration;

    return {
      ...configuration,
      name: name,
      database: name,
      entities: [path.resolve(`${__dirname}/../**/*.entity.{ts,js}`)],
      migrationsRun: true,
      migrations: [path.resolve(`${__dirname}/../database/migration/tenant/*.{ts,js}`)]
    };
  }
}

@Module({
  providers: [TypeOrmConfig],
  exports: [TypeOrmConfig]
})
export class TypeOrmConfigModule {}

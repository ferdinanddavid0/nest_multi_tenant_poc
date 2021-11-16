import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from '../environment/environment';
import { TypeOrmConfig, TypeOrmConfigModule } from '../config/typeorm.config';
import { CryptographyModule } from './cryptography/cryptography.module';
import { JobModule } from './job/job.module';
import { LocaleModule } from './locale/locale.module';
import { MultiTenantModule } from './multi-tenant/multi-tenant.module';

@Global()
@Module({
  imports: [
    TypeOrmConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: TypeOrmConfig) => config.createTypeOrmOptions(),
      imports: [TypeOrmConfigModule],
      inject: [TypeOrmConfig]
    }),
    LocaleModule,
    CryptographyModule,
    MultiTenantModule,
    JobModule
  ],
  providers: [TypeOrmConfig],
  exports: [ConfigModule, TypeOrmModule, LocaleModule, CryptographyModule, MultiTenantModule, JobModule]
})
export class CoreModule {}

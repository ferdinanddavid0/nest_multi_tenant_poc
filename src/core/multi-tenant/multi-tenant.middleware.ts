import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { Connection } from 'typeorm';

import { MultiTenantService } from './multi-tenant.service';
import { TypeOrmConfig } from '../../config/typeorm.config';
import { Tenant } from './tenant.entity';

@Injectable()
export class MultiTenantMiddleware implements NestMiddleware {
  constructor(private multiTenantService: MultiTenantService, private connection: Connection, private typeormConfigService: TypeOrmConfig) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantName = req.headers['tenant'];
    const tenant: Tenant = await this.multiTenantService.findByTenantName(tenantName);

    if (!tenant) {
      throw new BadRequestException('Database Connection Error', "Tenant isn't registered");
    }

    const tenantConnection = await this.multiTenantService.resolveTenantConnection(tenant);
    tenantConnection.subscribers.push(...tenantConnection.subscribers);
    if (!tenantConnection) {
      throw new BadRequestException('Database Connection Error', "Can't establish connection to database.");
    }

    next();
  }
}

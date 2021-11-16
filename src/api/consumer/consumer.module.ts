import { Module } from '@nestjs/common';

import { CheckTenantWorker } from './check-tenant.worker';
import { UserService } from '../user.service';

@Module({
  imports: [UserService],
  providers: [UserService, CheckTenantWorker]
})
export class ConsumerModule {}

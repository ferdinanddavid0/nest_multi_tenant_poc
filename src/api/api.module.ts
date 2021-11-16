import { Module } from '@nestjs/common';

import { ApiController } from './api.controller';
import { UserEntityEventSubscriber } from './user.entity';
import { UserService } from './user.service';

@Module({
  controllers: [ApiController],
  providers: [UserService, UserEntityEventSubscriber],
  exports: [UserService]
})
export class ApiModule {}

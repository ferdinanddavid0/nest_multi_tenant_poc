import { BullModule, BullModuleAsyncOptions, BullModuleOptions } from '@nestjs/bull';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/api/user.service';

import { BullConfig } from '../../config/bull.config';
import { QueueConstant } from '../constant/queue.constant';

const QUEUES: Array<Partial<BullModuleOptions>> = [
  { name: QueueConstant.DEFAULT },
  { name: QueueConstant.MAIN },
  { name: QueueConstant.ASYNC },
  { name: QueueConstant.BACKGROUND }
];

@Module({
  imports: [
    BullModule.forRootAsync({
      useClass: BullConfig,
      inject: [ConfigService, UserService]
    }),
    BullModule.registerQueue(...QUEUES)
  ],
  exports: [BullModule]
})
export class JobModule {
  static registerQueue(...options: Array<BullModuleOptions>): DynamicModule {
    return BullModule.registerQueue(...options);
  }

  static async registerQueueAsync(...options: Array<BullModuleAsyncOptions>): Promise<DynamicModule> {
    return BullModule.registerQueueAsync(...options);
  }
}

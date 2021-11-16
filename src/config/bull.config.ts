import { SharedBullConfigurationFactory } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bull';

@Injectable()
export class BullConfig implements SharedBullConfigurationFactory {
  constructor(private readonly config: ConfigService) {}

  async createSharedConfiguration(): Promise<QueueOptions> {
    const config: any = this.config.get('queue.bull');
    const redis: any = this.config.get('queue.redis');

    return Promise.resolve({ redis, ...config });
  }
}

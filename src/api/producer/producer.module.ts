import { Module } from '@nestjs/common';

import { ProducerController } from './producer.controller';

@Module({
  controllers: [ProducerController]
})
export class ProducerModule {}

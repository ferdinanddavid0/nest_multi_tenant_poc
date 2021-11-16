import { Module } from '@nestjs/common';

import { ApiModule } from './api/api.module';
import { ConsumerModule } from './api/consumer/consumer.module';
import { ProducerModule } from './api/producer/producer.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [CoreModule, ApiModule, ProducerModule, ConsumerModule]
})
export class AppModule {}

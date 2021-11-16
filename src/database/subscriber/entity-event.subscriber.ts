import { Injectable } from '@nestjs/common';
import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent, LoadEvent, UpdateEvent } from 'typeorm';

@Injectable()
@EventSubscriber()
export abstract class EntityEventSubscriber<T> implements EntitySubscriberInterface<T> {
  protected abstract readonly type: any;

  protected constructor(connection: Connection) {
    connection.subscribers.push(this as EntitySubscriberInterface<T>);
  }

  public listenTo(): any {
    return this.type;
  }

  from(entity: T): Promise<T> {
    console.log('subscriber from');

    return Promise.resolve(entity);
  }

  to(entity: T): Promise<T> {
    console.log('subscriber to');

    return Promise.resolve(entity);
  }

  public afterLoad(entity: T, event?: LoadEvent<T>): Promise<any> {
    console.log('after load');
    return this.from(event.entity);
  }

  public beforeInsert(event: InsertEvent<T>): Promise<any> {
    console.log('before Insert');
    return this.to(event.entity);
  }

  public beforeUpdate(event: UpdateEvent<T>): Promise<any> {
    return this.to(event.entity as T);
  }
}

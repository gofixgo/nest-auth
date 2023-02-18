import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { DeviceRepository } from '../device.repository';
import { v4 } from 'uuid';
import { User } from 'src/modules/user/user.entity';

@Entity({ customRepository: () => DeviceRepository })
export class Device {
  [EntityRepositoryType]?: DeviceRepository;

  @PrimaryKey({ type: 'uuid' }) device_id: string = v4();
  @Unique({ name: 'uq_device_endpoint', properties: ['device_endpoint', 'device_user'] })
  @Property({ type: 'varchar', nullable: false })
  device_endpoint: string;
  @Property({ type: 'varchar', nullable: false }) device_p256dh: string;
  @Property({ type: 'varchar', nullable: false }) device_auth: string;
  @Property({ type: 'int', nullable: true }) device_expiration_time?: number;
  @Property({ type: 'datetime', nullable: false }) device_created_at: Date = new Date();
  @Property({ type: 'datetime', onUpdate: () => new Date() }) device_updated_at?: Date;
  @ManyToOne(() => User, { name: 'device_user_id', nullable: false }) device_user: User;
}

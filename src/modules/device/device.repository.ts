import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Device } from './entities/device.entity';

@Injectable()
export class DeviceRepository extends EntityRepository<Device> {}

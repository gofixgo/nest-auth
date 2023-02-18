import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { DeviceRepository } from './device.repository';
import { CreateDeviceDto } from './dto/create-device.dto';
import { EntityManager, serialize } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Device } from './entities/device.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '../user/user.entity';

@Injectable()
export class DeviceService {
  constructor(private readonly em: EntityManager, @InjectRepository(Device) private readonly repo: DeviceRepository) {}

  @OnEvent('device.create.one', { async: true, promisify: true })
  async create(data: CreateDeviceDto, reqUser: IUserAuth) {
    const user = await this.em.findOne(User, { user_id: reqUser?.user_id });
    const foundDevice = await this.repo.findOne({ device_endpoint: data.endpoint, device_user: { user_id: reqUser?.user_id } });
    if (foundDevice) {
      foundDevice.device_auth = data.keys.auth;
      foundDevice.device_p256dh = data.keys.p256dh;
      foundDevice.device_expiration_time = data.expirationTime;
      foundDevice.device_updated_at = new Date();
      await this.repo.persistAndFlush(foundDevice);
    } else {
      const result = this.repo.create({
        device_user: user,
        device_auth: data.keys.auth,
        device_endpoint: data.endpoint,
        device_p256dh: data.keys.p256dh,
        device_expiration_time: data.expirationTime,
      });
      await this.repo.persistAndFlush(result);
      return { result: serialize(result, { populate: ['device_user'] }), status: HttpStatus.CREATED };
    }
  }

  @OnEvent('device.exist.one', { async: true, promisify: true })
  async existOneByEndpoint(endpoint: string, user: IUserAuth) {
    const device = await this.repo.count({ device_endpoint: endpoint, device_user: { user_id: user.user_id } });
    if (!device) throw new NotFoundException('دستگاه با آیدی داده شده یافت نشد.');
    return { result: device > 0, status: HttpStatus.OK };
  }

  @OnEvent('device.delete.one', { async: true, promisify: true })
  async deleteOneById(id: string) {
    const device = await this.repo.findOne({ device_id: id });
    if (!device) throw new NotFoundException('دستگاه با آیدی داده شده یافت نشد.');
    const result = this.repo.remove(device);
    await this.repo.persistAndFlush(result);
    return { status: HttpStatus.OK };
  }

  @OnEvent('device.delete.one.endpoint', { async: true, promisify: true })
  async deleteByEndpoint(endpoint: string) {
    const device = await this.repo.findOne({ device_endpoint: endpoint });
    if (!device) throw new NotFoundException('دستگاه یافت نشد.');
    const result = this.repo.remove(device);
    await this.repo.persistAndFlush(result);
    return { status: HttpStatus.OK };
  }
}

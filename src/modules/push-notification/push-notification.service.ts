import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeviceService } from '../device/device.service';
import { WebPushError } from 'web-push';
import { webpush } from './core/web-push';
import { CreatePushNotificationDto } from './dto/create-push-notification.dto';
import { SendPushNotificationToOneUserDto } from './push-notification.type';
import { EntityManager } from '@mikro-orm/core';
import { Device } from '../device/entities/device.entity';
import { User } from '../user/user.entity';

export const PushNotificationEvents = {
  SEND_TO_MANY_DEVICES: 'push-notification.send.many.devices',
  SEND_TO_ONE_DEVICE: 'push-notification.send.one.device',
  SEND_TO_USERS: 'push-notification.send.users',
};

@Injectable()
export class PushNotificationService {
  constructor(private readonly em: EntityManager, private readonly deviceService: DeviceService) {}
  async subscribe(createDto: CreatePushNotificationDto, user: IUserAuth) {
    return await this.deviceService.create(createDto, user);
  }

  @OnEvent(PushNotificationEvents.SEND_TO_MANY_DEVICES, { async: true })
  async sendToManyDevices(devices: webpush.PushSubscription[], payload: any = null) {
    await Promise.all(
      devices.map(async (d) => {
        return await this.sendToOneDevice(d, payload);
      }),
    );
  }

  @OnEvent(PushNotificationEvents.SEND_TO_ONE_DEVICE, { async: true })
  async sendToOneDevice(device: webpush.PushSubscription, payload: any = null) {
    const { publicKey, privateKey } = this.getKeys();
    if (typeof payload === 'object') {
      payload = JSON.stringify(payload);
    }
    await webpush
      .sendNotification(device, payload, {
        vapidDetails: {
          privateKey,
          publicKey,
          subject: 'mailto:mirzaei2334@gmail.com',
        },
      })
      .catch(async (e: WebPushError) => {
        console.error(e);
        if (e.statusCode === 404) {
          await this.deviceService.deleteByEndpoint(e.endpoint);
        }
      });
  }

  @OnEvent(PushNotificationEvents.SEND_TO_USERS, { async: true })
  async sendToUsers(payload: SendPushNotificationToOneUserDto, user?: IUserAuth) {
    const devices: Device[] = [];
    if (payload.user_ids) {
      const users = await this.em.fork().find(User, { user_id: { $in: payload.user_ids } }, { populate: ['user_devices'] });
      for await (const u of users) {
        const usersDevices = await u.user_devices.loadItems();
        devices.push(...usersDevices);
      }
    } else {
      if (!!payload.role_id) {
        const usersDevices = await this.getManyUsersDevices(payload.role_id);
        devices.push(...usersDevices);
      } else if (!!payload.roles_ids) {
        const usersDevices = await this.getManyUsersDevices(payload.roles_ids);
        devices.push(...usersDevices);
      }
    }
    const resolvedDevices = devices.map((d) => this.resolveDevice(d));
    console.log(resolvedDevices);
    await this.sendToManyDevices(resolvedDevices, payload.payload);
  }

  getKeys() {
    const PUBLIC_KEY = process.env.WEB_PUSH_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.WEB_PUSH_PRIVATE_KEY;
    return {
      publicKey: PUBLIC_KEY,
      privateKey: PRIVATE_KEY,
    };
  }

  async getManyUsersDevices(roles_ids: string[] | string) {
    const resolvedRoles = Array.isArray(roles_ids) ? roles_ids : [roles_ids];
    const devices: Device[] = [];
    const users = await this.em.fork().find(User, { user_role_ids: { $contains: resolvedRoles } }, { populate: ['user_devices'] });
    for await (const u of users) {
      const usersDevices = await u.user_devices.loadItems();
      devices.push(...usersDevices);
    }
    return devices;
  }

  async getOneUserDevices(role_id: string) {
    const user = await this.em.fork().findOne(User, { user_role_ids: { $contains: [role_id] } }, { populate: ['user_devices'] });
    return await user.user_devices.loadItems();
  }

  resolveDevice(device: Device): webpush.PushSubscription {
    return {
      endpoint: device.device_endpoint,
      keys: {
        p256dh: device.device_p256dh,
        auth: device.device_auth,
      },
    };
  }
}

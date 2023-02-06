import { DynamicModule, Module } from '@nestjs/common';
import { DeviceModule } from '../device/device.module';
import { webpush } from './core/web-push';
import { PushNotificationController } from './push-notification.controller';
import { PushNotificationService } from './push-notification.service';

@Module({
  imports: [DeviceModule],
  controllers: [PushNotificationController],
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class PushNotificationModule {
  static configure(): DynamicModule {
    const PUBLIC_KEY = process.env.WEB_PUSH_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.WEB_PUSH_PRIVATE_KEY;
    webpush.setVapidDetails('mailto:email@email.com', PUBLIC_KEY, PRIVATE_KEY);
    return {
      global: true,
      module: PushNotificationModule,
    };
  }
}

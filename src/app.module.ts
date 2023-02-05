import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DeviceModule } from './modules/device/device.module';
import { PushNotificationModule } from './modules/push-notification/push-notification.module';
import { CaslModule } from './modules/casl/casl.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(),
    CaslModule,
    UserModule,
    AuthModule,
    DeviceModule,
    PushNotificationModule,
  ],
})
export class AppModule {}

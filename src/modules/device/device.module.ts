import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { Device } from './entities/device.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Device])],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqUser } from 'src/common/decorators/req-user.decorator';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { DeviceService } from './device.service';

@Controller('devices')
@ApiTags('دستگاه ها')
@ApiBearerAuth()
export class DeviceController {
  constructor(private readonly service: DeviceService) {}

  @UseGuards(JwtGuard)
  @Post('exists')
  async existOneByEndpoint(@Body('endpoint') endpoint: string, @ReqUser() user: IUserAuth) {
    return await this.service.existOneByEndpoint(endpoint, user);
  }
}

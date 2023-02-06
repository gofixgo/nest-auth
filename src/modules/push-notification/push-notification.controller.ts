import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqUser } from 'src/common/decorators/req-user.decorator';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { CreatePushNotificationDto } from './dto/create-push-notification.dto';
import { PushNotificationService } from './push-notification.service';

@Controller('push-notification')
@ApiTags('Push Notification')
@ApiBearerAuth()
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @UseGuards(JwtGuard)
  @Post('subscribe')
  async subscribe(@Body() body: CreatePushNotificationDto, @ReqUser() user: IUserAuth) {
    return await this.pushNotificationService.subscribe(body, user);
  }

  @MessagePattern('push-notification.subscribe')
  async subscribeEvent(@Payload() payload: CreatePushNotificationDto, user: IUserAuth) {
    return await this.pushNotificationService.subscribe(payload, user);
  }
}

import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { CreatePushNotificationDto } from 'src/modules/push-notification/dto/create-push-notification.dto';

export class CreateDeviceDto extends CreatePushNotificationDto {
  @IsNotEmpty()
  @IsUUID('4')
  user_id: string;
}

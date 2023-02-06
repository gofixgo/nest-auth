import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { webpush } from '../core/web-push';

export class CreatePushNotificationKyesObjDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  p256dh: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  auth: string;
}

export class CreatePushNotificationDto implements webpush.PushSubscription {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  endpoint: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreatePushNotificationKyesObjDto)
  keys: CreatePushNotificationKyesObjDto;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  expirationTime?: string;
}

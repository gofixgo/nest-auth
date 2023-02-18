import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SendPushNotificationToOneUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ each: true })
  user_ids?: string[];
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  role_id?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ each: true })
  roles_ids?: string[];
  @ApiProperty({ required: false })
  @IsOptional()
  payload?: any;
}

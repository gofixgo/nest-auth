import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectUserDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString({ each: true })
  user_children_ids: string[];
}

export class DisconnectUserDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString({ each: true })
  user_children_ids: string[];
}

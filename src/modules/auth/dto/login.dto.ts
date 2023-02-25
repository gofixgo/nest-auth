import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  username: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @Length(4, 255)
  password: string;
}

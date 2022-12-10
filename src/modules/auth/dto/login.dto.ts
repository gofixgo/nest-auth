import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @Length(8, 255)
  username: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @Length(8, 255)
  password: string;
}

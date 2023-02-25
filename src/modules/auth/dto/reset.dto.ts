import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  @Length(4, 255)
  old_password: string;
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  @Length(4, 255)
  new_password: string;
}

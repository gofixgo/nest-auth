import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'شماره همراه الزامیست.' })
  @IsString()
  @Matches(/\d{11}/, {
    message: 'فرمت وارد شده برای شماره همراه صحیح نمی باشد. (فرمت صحیح: 09121231212)',
  })
  user_phone_number: string;
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'نام الزامیست.' })
  @IsString()
  user_first_name: string;
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'نام خانوادگی الزامیست.' })
  @IsString()
  user_last_name: string;
  @ApiProperty({ required: true })
  @IsOptional()
  @IsString()
  @Length(3, 255)
  user_username?: string;
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'رمز عبور الزامیست.' })
  @IsString()
  @Length(8, 255)
  user_password: string;
  @ApiProperty({ required: true })
  @IsOptional()
  @IsEmail()
  user_email?: string;
  @ApiProperty({ required: true })
  @IsOptional()
  @IsString()
  @Matches(/\d*/, {
    message: 'فرمت وارد شده برای شماره همراه صحیح نمی باشد. (فرمت صحیح: 05131235465)',
  })
  user_tel?: string;
  @ApiProperty({ required: true })
  @IsOptional()
  @IsString()
  user_address?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  user_role_ids?: string[];
}

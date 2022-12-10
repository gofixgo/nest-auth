import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tel: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone_number: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  user_first_name: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  user_last_name: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address: string;
}

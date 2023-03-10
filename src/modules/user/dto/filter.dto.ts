import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids: string[];
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  role_id?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID('4', { each: true })
  roles_ids?: string[];
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parent_id?: string;
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
  first_name: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  last_name: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address: string;
}

import { EntityRepositoryType, PrimaryKey, t } from '@mikro-orm/core';
import { Entity, Property } from '@mikro-orm/core';
import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsDate } from 'class-validator';
import { UserRepository } from './user.repository';
import { v4 } from 'uuid';

@Entity({ customRepository: () => UserRepository })
export class User {
  [EntityRepositoryType]?: UserRepository;
  @PrimaryKey({ type: t.uuid })
  user_id: string = v4();
  @IsNotEmpty()
  @IsString()
  @Property()
  user_first_name: string;
  @IsNotEmpty()
  @IsString()
  @Property()
  user_last_name: string;
  @IsNotEmpty()
  @IsString()
  @Property()
  user_username: string;
  @IsNotEmpty()
  @IsString()
  @Property({ hidden: true })
  user_password: string;
  @IsOptional()
  @IsString()
  @Property()
  user_email?: string;
  @IsOptional()
  @IsString()
  @Property()
  user_phone_number: string;
  @IsOptional()
  @IsString()
  @Property()
  user_address?: string;
  @IsOptional()
  @IsString()
  @Property()
  user_tel?: string;
  @IsOptional()
  @IsBoolean()
  @Property({ type: 'boolean', default: false })
  user_deleted: boolean;
  @IsOptional()
  @IsDate()
  @Property({ type: 'datetime', defaultRaw: 'NOW()' })
  user_created_at: Date;
  @IsOptional()
  @IsDate()
  @Property({ type: 'datetime', defaultRaw: 'NOW()' })
  user_deleted_at?: Date;
  @IsOptional()
  @IsDate()
  @Property({ type: 'datetime', defaultRaw: 'NOW()' })
  user_updated_at?: Date;
}

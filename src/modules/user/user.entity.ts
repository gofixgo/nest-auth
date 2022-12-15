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
  @Property()
  user_first_name: string;
  @Property()
  user_last_name: string;
  @Property()
  user_username: string;
  @Property({ hidden: true })
  user_password: string;
  @Property()
  user_email?: string;
  @Property()
  user_phone_number: string;
  @Property()
  user_address?: string;
  @Property()
  user_tel?: string;
  @Property({ type: 'boolean', default: false })
  user_deleted: boolean;
  @Property({ type: 'datetime', defaultRaw: 'NOW()' })
  user_created_at: Date;
  @Property({ type: 'datetime', defaultRaw: 'NOW()' })
  user_deleted_at?: Date;
  @Property({ type: 'datetime', defaultRaw: 'NOW()' })
  user_updated_at?: Date;
}

import { v4 } from 'uuid';
import { Collection, EntityRepositoryType, ManyToOne, OneToMany, PrimaryKey, t } from '@mikro-orm/core';
import { Entity, Property } from '@mikro-orm/core';
import { UserRepository } from './user.repository';
import { IsNotEmptyObject, IsString } from 'class-validator';
import { Device } from '../device/entities/device.entity';

@Entity({ customRepository: () => UserRepository })
export class User {
  [EntityRepositoryType]?: UserRepository;
  @PrimaryKey({ type: t.uuid }) user_id: string = v4();
  @Property() user_first_name: string;
  @Property() user_last_name: string;
  @Property() user_address?: string;
  @Property() user_tel?: string;
  @Property({ unique: true }) user_username: string;
  @Property({ hidden: true }) user_password: string;
  @Property({ unique: true }) user_email?: string;
  @Property({ unique: true }) user_phone_number: string;
  @IsNotEmptyObject({ nullable: false }) @IsString({ each: true }) @Property({ type: 'array', nullable: true }) user_role_ids?: string[];
  @IsNotEmptyObject({ nullable: false }) @IsString({ each: true }) @Property({ type: 'array', nullable: true }) user_project_ids: number[];
  @OneToMany(() => Device, 'device_user', { name: 'user_devices_ids', nullable: true }) user_devices? = new Collection<Device>(this);
  @Property({ type: 'boolean', default: false }) user_deleted: boolean;
  @Property({ type: 'datetime', defaultRaw: 'NOW()' }) user_created_at: Date;
  @Property({ type: 'datetime' }) user_deleted_at?: Date;
  @Property({ type: 'datetime' }) user_updated_at?: Date;
  @ManyToOne(() => User, { nullable: true, name: 'user_parent_id' }) user_parent: User;
  @OneToMany(() => User, 'user_parent', { nullable: true, name: 'user_children_ids' }) user_children = new Collection<User>(this);
}

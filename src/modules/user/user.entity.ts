import { Collection, EntityRepositoryType, ManyToOne, OneToMany, PrimaryKey, t } from '@mikro-orm/core';
import { Entity, Property } from '@mikro-orm/core';
import { UserRepository } from './user.repository';
import { v4 } from 'uuid';

@Entity({ customRepository: () => UserRepository })
export class User {
  [EntityRepositoryType]?: UserRepository;
  @PrimaryKey({ type: t.uuid }) user_id: string = v4();
  @Property() user_first_name: string;
  @Property() user_last_name: string;
  @Property({ unique: true }) user_username: string;
  @Property({ hidden: true }) user_password: string;
  @Property({ unique: true }) user_email?: string;
  @Property({ unique: true }) user_phone_number: string;
  @Property() user_address?: string;
  @Property() user_tel?: string;
  @Property({ type: 'boolean', default: false }) user_deleted: boolean;
  @Property({ type: 'datetime', defaultRaw: 'NOW()' }) user_created_at: Date;
  @Property({ type: 'datetime' }) user_deleted_at?: Date;
  @Property({ type: 'datetime' }) user_updated_at?: Date;
  @ManyToOne(() => User, { nullable: true, name: 'user_parent_id' }) user_parent: User;
  @OneToMany(() => User, 'user_parent', { nullable: true, name: 'user_children_ids' }) user_children = new Collection<User>(this);
}

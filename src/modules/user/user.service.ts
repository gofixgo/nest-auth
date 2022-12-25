import { clean } from '@common/helpers/clean.helper';
import { QBFilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConnectUserDto, DisconnectUserDto } from './dto/connect.dto';
import { CreateUserDto } from './dto/create.dto';
import { FilterUserDto } from './dto/filter.dto';
import { UpdateUserDto } from './dto/update.dto';
import { USER_SELECT_ALL } from './user.constant';
import { User } from './user.entity';
import { UserHelper } from './user.helper';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository, private readonly em: EntityManager, private readonly helper: UserHelper) {}

  async create(data: CreateUserDto, user?: IUserAuth) {
    if (!data.user_username) data.user_username = data.user_phone_number;
    const repo = this.em.fork().getRepository(User);
    data.user_password = this.helper.hashPassword(data.user_password);
    const createdUser = repo.create(data);
    repo.persist(createdUser);
    await repo.flush();
    return {
      result: createdUser,
      status: HttpStatus.CREATED,
      message: 'کاربر جدید با موفقیت ثبت شد.',
    };
  }

  async connect(data: ConnectUserDto, user: IUserAuth) {
    const found_user = await this.repo.findOne({ user_id: user.user_id });
    const found_users_children = await this.repo.find({ user_children: data.user_children_ids.map((id) => ({ user_id: id })) });
    found_users_children.forEach((u) => {
      u.user_parent = found_user;
    });
    found_user.user_children.add(found_users_children);
    await this.repo.persist(found_user).flush();
    return {
      status: HttpStatus.CREATED,
      message: 'کاربر جدید با موفقیت ثبت شد.',
    };
  }

  async disconnect(data: DisconnectUserDto, user?: IUserAuth) {
    const found_user = await this.repo.findOne({ user_id: user.user_id });
    const found_users_children = await this.repo.find({ user_children: data.user_children_ids.map((id) => ({ user_id: id })) });
    found_users_children.forEach((u) => {
      u.user_parent = null;
    });
    found_user.user_children.remove(found_users_children);
    await this.repo.persist(found_user).flush();
    return {
      status: HttpStatus.CREATED,
      message: 'کاربر جدید با موفقیت ثبت شد.',
    };
  }

  async getMany(filters: FilterUserDto, user?: IUserAuth): Promise<ServiceReturnType<User[]>> {
    const qb = this.em.fork().createQueryBuilder(User);
    const where = clean<QBFilterQuery<User>>({
      user_tel: filters.tel,
      user_email: filters.email,
      user_address: filters.address,
      user_username: filters.username,
      user_last_name: filters.last_name,
      user_first_name: filters.first_name,
      user_phone_number: filters.phone_number,
      user_parent: { user_id: filters.parent_id },
      user_deleted: false,
    });
    const result = await qb.select(USER_SELECT_ALL).where(where).execute();
    return {
      result,
      status: HttpStatus.OK,
    };
  }

  async getOneById(id: string, user: IUserAuth): Promise<ServiceReturnType<User>> {
    const qb = this.em.fork().createQueryBuilder(User);
    const result = await qb.select(USER_SELECT_ALL).where({ user_id: id, user_deleted: false }).execute();
    return {
      result: result[0],
      status: HttpStatus.CREATED,
    };
  }

  async getOneByUsername(username: string, user?: IUserAuth): Promise<ServiceReturnType<User>> {
    const qb = this.em.fork().createQueryBuilder(User);
    const result = await qb.select(USER_SELECT_ALL).where({ user_username: username, user_deleted: false }).execute();
    return {
      result: result[0],
      status: HttpStatus.CREATED,
    };
  }

  async deleteOneById(id: string, user: IUserAuth): Promise<ServiceReturnType> {
    const qb = this.em.fork().createQueryBuilder(User);
    await qb.delete().where({ user_id: id, user_deleted: false }).execute();
    return {
      status: HttpStatus.OK,
    };
  }

  async deleteMany(filters: FilterUserDto, user: IUserAuth): Promise<ServiceReturnType> {
    const qb = this.em.fork().createQueryBuilder(User);
    const where = clean<QBFilterQuery<User>>({
      user_tel: filters.tel,
      user_email: filters.email,
      user_address: filters.address,
      user_username: filters.username,
      user_last_name: filters.last_name,
      user_first_name: filters.first_name,
      user_phone_number: filters.phone_number,
      user_deleted: false,
    });
    await qb.delete().where(where).execute();
    return {
      status: HttpStatus.OK,
    };
  }

  async softDeleteOneById(id: string, user: IUserAuth): Promise<ServiceReturnType> {
    const qb = this.em.fork().createQueryBuilder(User);
    await qb.update({ user_deleted: true, user_deleted_at: new Date() }).where({ user_id: id, user_deleted: false }).execute();
    return {
      status: HttpStatus.OK,
    };
  }

  async updateOneById(id: string, data: UpdateUserDto, user: IUserAuth): Promise<ServiceReturnType<User>> {
    const qb = this.em.fork().createQueryBuilder(User);
    const result = await qb
      .update({ ...data, user_updated_at: new Date() })
      .where({ user_id: id, user_deleted: false })
      .select(USER_SELECT_ALL)
      .execute();
    return {
      result: result[0],
      status: HttpStatus.OK,
    };
  }

  async updateMany(filters: FilterUserDto, data: UpdateUserDto, user: IUserAuth): Promise<ServiceReturnType<User[]>> {
    const qb = this.em.fork().createQueryBuilder(User);
    const where = clean<QBFilterQuery<User>>({
      user_tel: filters.tel,
      user_email: filters.email,
      user_address: filters.address,
      user_username: filters.username,
      user_last_name: filters.last_name,
      user_first_name: filters.first_name,
      user_phone_number: filters.phone_number,
      user_deleted: false,
    });
    const result = await qb.update(data).where(where).select(USER_SELECT_ALL).execute();
    return {
      result,
      status: HttpStatus.OK,
    };
  }
}

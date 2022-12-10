import { clean } from '@common/helpers/clean.helper';
import { QBFilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { HttpStatus, Injectable } from '@nestjs/common';
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

  async create(data: CreateUserDto, user: IUserAuth) {
    if (!data.user_username) data.user_username = data.user_phone_number;
    data.user_password = this.helper.hashPassword(data.user_password);
    const createdUser = this.repo.create(data);
    this.repo.persist(createdUser);
    await this.repo.flush();
    const result = await this.repo.findOne(createdUser);
    return {
      result: result,
      status: HttpStatus.CREATED,
      message: 'کاربر جدید با موفقیت ثبت شد.',
    };
  }

  async getMany(filters: FilterUserDto, user: IUserAuth): Promise<ServiceReturnType<User[]>> {
    const qb = this.em.createQueryBuilder(User);
    const where = clean<QBFilterQuery<User>>({
      user_tel: filters.tel,
      user_email: filters.email,
      user_address: filters.address,
      user_username: filters.username,
      user_last_name: filters.user_last_name,
      user_first_name: filters.user_first_name,
      user_phone_number: filters.phone_number,
      user_deleted: false,
    });
    const result = await qb.select(USER_SELECT_ALL).where(where).execute();
    return {
      result,
      status: HttpStatus.OK,
    };
  }

  async getOneById(id: string, user: IUserAuth): Promise<ServiceReturnType<User>> {
    const qb = this.em.createQueryBuilder(User);
    const result = await qb.select(USER_SELECT_ALL).where({ user_id: id, user_deleted: false }).execute();
    return {
      result: result[0],
      status: HttpStatus.CREATED,
    };
  }

  async getOneByUsername(username: string, user: IUserAuth): Promise<ServiceReturnType<User>> {
    const qb = this.em.createQueryBuilder(User);
    const result = await qb.select(USER_SELECT_ALL).where({ user_username: username, user_deleted: false }).execute();
    return {
      result: result[0],
      status: HttpStatus.CREATED,
    };
  }

  async deleteOneById(id: string, user: IUserAuth): Promise<ServiceReturnType> {
    const qb = this.em.createQueryBuilder(User);
    await qb.delete().where({ user_id: id, user_deleted: false }).execute();
    return {
      status: HttpStatus.OK,
    };
  }

  async deleteMany(filters: FilterUserDto, user: IUserAuth): Promise<ServiceReturnType> {
    const qb = this.em.createQueryBuilder(User);
    const where = clean<QBFilterQuery<User>>({
      user_tel: filters.tel,
      user_email: filters.email,
      user_address: filters.address,
      user_username: filters.username,
      user_last_name: filters.user_last_name,
      user_first_name: filters.user_first_name,
      user_phone_number: filters.phone_number,
      user_deleted: false,
    });
    await qb.delete().where(where).execute();
    return {
      status: HttpStatus.OK,
    };
  }

  async softDeleteOneById(id: string, user: IUserAuth): Promise<ServiceReturnType> {
    const qb = this.em.createQueryBuilder(User);
    await qb.update({ user_deleted: true, user_deleted_at: new Date() }).where({ user_id: id, user_deleted: false }).execute();
    return {
      status: HttpStatus.OK,
    };
  }

  async updateOneById(id: string, data: UpdateUserDto, user: IUserAuth): Promise<ServiceReturnType<User>> {
    const qb = this.em.createQueryBuilder(User);
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
    const qb = this.em.createQueryBuilder(User);
    const where = clean<QBFilterQuery<User>>({
      user_tel: filters.tel,
      user_email: filters.email,
      user_address: filters.address,
      user_username: filters.username,
      user_last_name: filters.user_last_name,
      user_first_name: filters.user_first_name,
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

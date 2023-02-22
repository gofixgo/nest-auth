import * as cleanDeep from 'clean-deep';
import { QBFilterQuery, serialize, UniqueConstraintViolationException, wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { ConflictException, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConnectUserDto, DisconnectUserDto } from './dto/connect.dto';
import { CreateUserDto } from './dto/create.dto';
import { FilterUserDto } from './dto/filter.dto';
import { UpdateUserDto } from './dto/update.dto';
import { User } from './user.entity';
import { UserHelper } from './user.helper';
import { UserRepository } from './user.repository';
import { clean } from '@common/helpers/clean.helper';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { CASL_TOKEN } from '../casl/casl.module';
import { BOODJEH_TOKEN } from '../boodjeh/boodjeh.module';

@Injectable()
export class UserService {
  constructor(
    private readonly repo: UserRepository,
    private readonly em: EntityManager,
    private readonly helper: UserHelper,
    @Inject(CASL_TOKEN) private readonly client: ClientProxy,
    @Inject(BOODJEH_TOKEN) private readonly boodjehClient: ClientProxy,
  ) {}

  async create(data: CreateUserDto, user?: IUserAuth) {
    await this.helper.canCreate(data, user);
    if (!data.user_username) data.user_username = data.user_phone_number;
    const repo = this.em.fork().getRepository(User);
    data.user_password = this.helper.hashPassword(data.user_password);
    try {
      const createdUser = repo.create(clean(data));
      repo.persist(createdUser);
      await repo.flush();
      return {
        result: wrap(createdUser).toObject(),
        status: HttpStatus.CREATED,
        message: 'کاربر جدید با موفقیت ثبت شد.',
      };
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) throw new ConflictException('کاربر با مشخصات وارد شده قبلا ثبت شده است.');
    }
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
    const result = await qb
      .select('*')
      .where(
        (cleanDeep as any)({
          user_id: { $in: filters.ids },
          user_tel: filters.tel,
          user_email: filters.email,
          user_address: filters.address,
          user_username: filters.username,
          user_last_name: filters.last_name,
          user_first_name: filters.first_name,
          user_phone_number: filters.phone_number,
          user_parent: { user_id: filters.parent_id },
          user_role_ids: { $contains: filters.roles_ids },
          user_deleted: false,
        }),
      )
      .execute();
    return {
      result: await this.helper.serializeMany(result),
      status: HttpStatus.OK,
    };
  }

  async getOneById(id: string, user: IUserAuth): Promise<ServiceReturnType<User>> {
    const qb = this.em.fork().createQueryBuilder(User);
    const [result] = await qb.select('*').where({ user_id: id, user_deleted: false }).execute();
    if (!result) throw new NotFoundException('کاربر با آیدی وارد شده یافت نشد.');
    delete result.user_password;
    const userRolesObs = this.client.send('role.find.many', { ids: result.user_role_ids });
    // const userProjectsObs = this.boodjehClient.send('group.find.many', { ids: result.user_project_ids });
    // const foundUserProjects = await lastValueFrom(userProjectsObs);
    const foundUserRoles = await lastValueFrom(userRolesObs);
    if (!foundUserRoles) throw new InternalServerErrorException('مشکلی در یافتن نقش های کاربر رخ داد.');
    (result as any).user_roles = foundUserRoles?.result;
    // (result as any).user_projects = foundUserProjects?.result;
    (result as any).user_is_admin = (user as any).user_roles.some((r: Role) => r.role_name === 'SUPER_ADMIN');
    return { result, status: HttpStatus.CREATED };
  }

  async getOneByUsername(username: string, user?: IUserAuth): Promise<ServiceReturnType<User>> {
    const qb = this.em.fork().createQueryBuilder(User);
    const [result] = await qb.select('*').where({ user_username: username, user_deleted: false }).execute();
    if (!result) throw new NotFoundException('کاربر با آیدی وارد شده یافت نشد.');
    delete result.user_password;
    const userRolesObs = this.client.send('role.find.many', { ids: result.user_role_ids });
    // const userProjectsObs = this.boodjehClient.send('group.find.many', { ids: result.user_project_ids });
    const foundUserRoles = await lastValueFrom(userRolesObs);
    // const foundUserProjects = await lastValueFrom(userProjectsObs);
    if (!foundUserRoles) throw new InternalServerErrorException('مشکلی در یافتن نقش های کاربر رخ داد.');
    (result as any).user_roles = foundUserRoles?.result;
    // (result as any).user_projects = foundUserProjects?.result;
    (result as any).user_is_admin = (result as any).user_roles?.some((r: Role) => r.role_name === 'SUPER_ADMIN');
    return { result, status: HttpStatus.CREATED };
  }

  async deleteOneById(id: string, user: IUserAuth): Promise<ServiceReturnType> {
    const qb = this.em.fork().createQueryBuilder(User);
    await qb.delete().where({ user_id: id, user_deleted: false }).execute();
    return { status: HttpStatus.OK };
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
    return { status: HttpStatus.OK };
  }

  async softDeleteOneById(id: string, user: IUserAuth): Promise<ServiceReturnType> {
    const qb = this.em.fork().createQueryBuilder(User);
    await qb.update({ user_deleted: true, user_deleted_at: new Date() }).where({ user_id: id, user_deleted: false }).execute();
    return { status: HttpStatus.OK };
  }

  async updateOneById(id: string, data: UpdateUserDto, user: IUserAuth) {
    await this.helper.canUpdate(id, data, user);
    data.user_password = data.user_password ? this.helper.hashPassword(data.user_password) : undefined;
    try {
      await this.em.fork().nativeUpdate(User, { user_id: id }, (cleanDeep as any)({ ...data, id: undefined, user_updated_at: new Date() }));
      const result = await this.em.fork().findOne(User, { user_id: id });
      return { result: serialize(result), status: HttpStatus.OK };
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) throw new ConflictException('کاربر با مشخصات وارد شده قبلا ثبت شده است.');
      else throw new InternalServerErrorException(e);
    }
  }

  async updateMany(filters: FilterUserDto, data: UpdateUserDto, user: IUserAuth): Promise<ServiceReturnType<User[]>> {
    const qb = this.em.fork().createQueryBuilder(User);
    const where = clean<QBFilterQuery<User>>({
      user_tel: filters.tel,
      user_email: filters.email,
      user_role_ids: { $contains: filters.role_id },
      user_address: filters.address,
      user_username: filters.username,
      user_last_name: filters.last_name,
      user_first_name: filters.first_name,
      user_phone_number: filters.phone_number,
      user_deleted: false,
    });
    try {
      const result = await qb.update(data).where(where).select('*').execute();
      return {
        result,
        status: HttpStatus.OK,
      };
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) throw new ConflictException('کاربر با مشخصات وارد شده قبلا ثبت شده است.');
    }
  }
}

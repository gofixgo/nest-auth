import * as _ from 'lodash';
import * as bcrypt from 'bcryptjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update.dto';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { CASL_TOKEN } from '../casl/casl.module';
import { User } from './user.entity';

@Injectable()
export class UserHelper {
  constructor(private readonly repo: UserRepository, private readonly em: EntityManager, @Inject(CASL_TOKEN) private readonly client: ClientProxy) {}

  async canCreate(data: UpdateUserDto, user: IUserAuth) {
    const roleCounts = await lastValueFrom(this.client.send('role.count', { ids: data.user_role_ids }));
    if (!data.user_role_ids?.length || !roleCounts?.result) throw new BadRequestException('انتخاب حداقل یک نقش الزامیست.');
    if (roleCounts?.result !== data.user_role_ids.length) throw new NotFoundException('حداقل یکی از نقش های انتخاب شده یافت نشد.');
  }

  async canUpdate(id: string, data: UpdateUserDto, user: IUserAuth) {
    const roleCounts = await lastValueFrom(this.client.send('role.count', { ids: data.user_role_ids }));
    if (!data.user_role_ids?.length || !roleCounts?.result) throw new BadRequestException('امکان حذف تمام نفش های کاربر وجود ندارد.');
    if (roleCounts?.result !== data.user_role_ids.length) throw new NotFoundException('حداقل یکی از نقش های انتخاب شده یافت نشد.');
  }

  hashPassword(password: string): string {
    return bcrypt.hashSync(password, parseInt(process.env.BCRYPT_HASH_SALT));
  }

  async serializeMany(data: User[]): Promise<(User & { user_roles: Role[] })[]> {
    const rolesIds = data.flatMap((s) => s.user_role_ids);
    const roles = await lastValueFrom(this.client.send('role.find.many', { roles_ids: rolesIds }));
    const mappedRoles = _.keyBy(roles, (s) => s.role_id);
    return data.map((s) => ({ ...s, user_roles: s.user_role_ids.map((s) => mappedRoles[s]), user_password: undefined }));
  }
}

import * as bcrypt from 'bcryptjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User } from '../user/user.entity';
import { ResetPasswordDto } from './dto/reset.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { clean } from '@common/helpers/clean.helper';
import { CASL_TOKEN } from '../casl/casl.module';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly em: EntityManager,
    @Inject(CASL_TOKEN) private readonly client: ClientProxy,
  ) {}

  async getOneByUsername(username: string) {
    const qb = this.em.fork().createQueryBuilder(User);
    const users_count = await qb.clone().getCount();
    if (users_count === 0) {
      const superAdminRole = await this.getSuperAdminRole();
      const user = await this.userService.create(
        clean({
          user_role_ids: [superAdminRole.role_id],
          user_username: process.env.ADMIN_USERNAME,
          user_password: process.env.ADMIN_PASSWORD,
          user_phone_number: process.env.ADMIN_PHONE_NUMBER,
          user_first_name: process.env.ADMIN_FIRST_NAME,
          user_last_name: process.env.ADMIN_LAST_NAME,
          user_address: process.env.ADMIN_ADDRESS,
          user_email: process.env.ADMIN_EMAIL,
          user_tel: process.env.ADMIN_TEL,
        }),
      );
      return user.result;
    } else {
      const [user] = await qb.select('*').where({ user_username: username, user_deleted: false }).execute();
      if (!user) throw new NotFoundException('لطفا دوباره وارد شوید.');
      const userRolesObs = this.client.send('role.find.many', { ids: user.user_role_ids });
      const foundUserRoles = await lastValueFrom(userRolesObs);
      if (!foundUserRoles) throw new InternalServerErrorException('مشکلی در یافتن نقش های کاربر رخ داد.');
      user.user_role_ids = foundUserRoles?.result;
      return user;
    }
  }

  async resetPassword(updateDto: ResetPasswordDto, user: IUserAuth) {
    const qb = this.em.createQueryBuilder(User);
    const [foundUser] = await qb.select('*').where({ user_username: user.user_username, user_deleted: false }).execute();
    const isOldPasswordCorrect = await bcrypt.compare(updateDto.old_password, foundUser.user_password);
    if (!isOldPasswordCorrect) {
      throw new BadRequestException('رمز قبلی وارد شده صحیح نمی باشد.');
    }
    await qb.update({ user_password: bcrypt.hashSync(updateDto.new_password, parseInt(process.env.BCRYPT_HASH_SALT)) }).where({ id: user.user_id });

    return {
      message: 'رمز با موفقیت تغییر یافت.',
      statusCode: 200,
    };
  }

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET, maxAge: `${parseInt(process.env.JWT_MAX_AGE_DAYS) * 24}h` });
      return decoded;
    } catch (e) {
      if (/invalid\s*token/.test(e.message)) throw new InternalServerErrorException('invalid-token');
      else throw new InternalServerErrorException();
    }
  }

  async getRules(user: IUserPayload) {
    const rules = await lastValueFrom(this.client.send('casl.rules.find.many', { roles_ids: user.user_roles?.map((s) => s.role_id) }));
    return rules.result;
  }

  async getMe(user: IUserPayload): Promise<any> {
    const rules = await this.getRules(user);
    return { ...user, user_rules: rules };
  }

  async getSuperAdminRole(): Promise<{ role_id: string; role_name: string; role_name_fa: string }> {
    try {
      const role = await lastValueFrom(this.client.send('role.find.one.name', 'SUPER_ADMIN'));
      if (!role) throw new NotFoundException('نقش سوپر ادمین یافت نشد.');
      return role.result;
    } catch (e) {
      throw new InternalServerErrorException('خطایی در پیدا کردن نقش سوپر ادمین رخ داد.');
    }
  }
}

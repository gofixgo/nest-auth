import * as bcrypt from 'bcryptjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../user/user.entity';
import { ResetPasswordDto } from './dto/reset.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService, private readonly em: EntityManager) {}

  async getOneByUsername(username: string) {
    const qb = this.em.fork().createQueryBuilder(User);
    const users_count = await qb.clone().getCount();
    if (users_count === 0) {
      const user = await this.userService.create({
        user_username: process.env.ADMIN_USERNAME,
        user_password: process.env.ADMIN_PASSWORD,
        user_phone_number: process.env.ADMIN_PHONE_NUMBER,
        user_first_name: process.env.ADMIN_FIRST_NAME,
        user_last_name: process.env.ADMIN_LAST_NAME,
        user_address: process.env.ADMIN_ADDRESS,
        user_email: process.env.ADMIN_EMAIL,
        user_tel: process.env.ADMIN_TEL,
      });
      return user.result;
    } else {
      const user = await qb.select('*').where({ user_username: username, user_deleted: false }).execute();
      return user[0];
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
}

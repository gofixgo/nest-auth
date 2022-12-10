import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../user/user.entity';
import { ResetPasswordDto } from './dto/reset.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly em: EntityManager) {}

  async getOneByUsername(username: string) {
    const qb = this.em.createQueryBuilder(User);
    const user = await qb.select('*').where({ user_username: username, user_deleted: false }).execute();
    return user[0];
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
}

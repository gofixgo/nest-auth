import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserHelper {
  constructor(private readonly repo: UserRepository, private readonly em: EntityManager) {}

  hashPassword(password: string): string {
    return bcrypt.hashSync(password, parseInt(process.env.BCRYPT_HASH_SALT));
  }
}

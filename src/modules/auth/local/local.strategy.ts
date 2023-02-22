import * as bcrypt from 'bcryptjs';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private readonly jwt: JwtService) {
    super();
  }

  async validate(username: string, password: string) {
    const expiresIn = `${parseInt(process.env.JWT_MAX_AGE_DAYS) * 24}h`;
    const user = await this.authService.getOneByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.user_password)) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور نادرست است.');
    }
    const payload: IUserPayload = {
      user_id: user.user_id,
      user_email: user.user_email,
      user_role_ids: user.user_role_ids,
      user_project_ids: user.user_project_ids,
      user_roles: (user as any).user_roles,
      user_projects: (user as any).user_projects,
      user_username: user.user_username,
      user_password: user.user_password,
      user_last_name: user.user_last_name,
      user_first_name: user.user_first_name,
      user_phone_number: user.user_phone_number,
      user_is_admin: (user as any).user_roles.some((r: Role) => r.role_name === 'SUPER_ADMIN'),
    };
    const token = this.jwt.sign(payload, { expiresIn, secret: process.env.JWT_SECRET });
    delete payload.user_password;
    return { ...payload, user_token: token };
  }
}

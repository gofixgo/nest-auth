import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/user/user.entity';
import { EntityDTO } from '@mikro-orm/core';
import { ClientProxy } from '@nestjs/microservices';
import { CASL_TOKEN } from 'src/modules/casl/casl.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private readonly jwt: JwtService, @Inject(CASL_TOKEN) private readonly client: ClientProxy) {
    super({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: IUserPayload & { token: string }): Promise<Omit<User | EntityDTO<User>, 'password'>> {
    const user = await this.authService.getOneByUsername(payload.user_username);
    if (!user) throw new UnauthorizedException('لطفا دوباره وارد شوید.');
    delete user.user_password;
    return user;
  }
}

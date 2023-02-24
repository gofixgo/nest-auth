import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqUser } from 'src/common/decorators/req-user.decorator';
import { AuthService } from './auth.service';
import { LocalGuard } from './local/local.guard';
import { Request } from 'express';
import { AuthLoginDto } from './dto/login.dto';
import { JwtGuard } from './jwt/jwt.guard';
import { ResetPasswordDto } from './dto/reset.dto';
import { MessagePattern, Transport } from '@nestjs/microservices';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Body() data: AuthLoginDto, @Req() { user: payload }: Request) {
    const typedUserPayload = payload as IUserPayload;
    const rules = await this.service.getRules(typedUserPayload);
    return { ...payload, user_rules: rules };
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Patch('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto, @ReqUser() user: IUserAuth) {
    return await this.service.resetPassword(data, user);
  }

  @MessagePattern('auth/validate/token')
  async validateToken(token: string) {
    return await this.service.validateToken(token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('me')
  async getMe(@ReqUser() user: IUserPayload) {
    return await this.service.getMe(user);
  }
}

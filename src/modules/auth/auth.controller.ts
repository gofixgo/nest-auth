import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqUser } from 'src/common/decorators/req-user.decorator';
import { AuthService } from './auth.service';
import { LocalGuard } from './local/local.guard';
import { Request } from 'express';
import { AuthLoginDto } from './dto/login.dto';
import { JwtGuard } from './jwt/jwt.guard';
import { ResetPasswordDto } from './dto/reset.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Body() data: AuthLoginDto, @Req() { user: payload }: Request) {
    return payload;
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Patch('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto, @ReqUser() user: IUserAuth) {
    return await this.service.resetPassword(data, user);
  }
}

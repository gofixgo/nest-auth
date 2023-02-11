import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { MessagePattern, Transport } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Action } from 'src/common/decorators/action-metadata.decorator';
import { ReqUser } from 'src/common/decorators/req-user.decorator';
import { Subject } from 'src/common/decorators/subject-metadata.decorator';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { CaslGuard } from '../casl/casl.guard';
import { CreateUserDto } from './dto/create.dto';
import { FilterUserDto } from './dto/filter.dto';
import { UpdateUserDto } from './dto/update.dto';
import { UserService } from './user.service';

const USERS_SUBJECT = 'AUTH_USERS';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly service: UserService) {}

  @Action(['CREATE'])
  @Subject(USERS_SUBJECT)
  @UseGuards(JwtGuard)
  @Post()
  async create(@Body() data: CreateUserDto, @ReqUser() user: IUserAuth) {
    return await this.service.create(data, user);
  }

  @MessagePattern('user/find/many', { transport: Transport.REDIS })
  async getManyEvent(@Query() filters: FilterUserDto) {
    return await this.service.getMany(filters);
  }

  @Action(['READ'])
  @Subject(USERS_SUBJECT)
  @UseGuards(JwtGuard, CaslGuard)
  @Get()
  async getMany(@Query() filters: FilterUserDto, @ReqUser() user: IUserAuth) {
    return await this.service.getMany(filters, user);
  }

  @Action(['READ'])
  @Subject(USERS_SUBJECT)
  @UseGuards(JwtGuard)
  @Get(':id')
  async getOneById(@Param('id') id: string, @ReqUser() user: IUserAuth) {
    return await this.service.getOneById(id, user);
  }

  @Action(['READ'])
  @Subject(USERS_SUBJECT)
  @UseGuards(JwtGuard)
  @Get(':username/username')
  async getOneByUsername(@Param('username') username: string, @ReqUser() user: IUserAuth) {
    return await this.service.getOneByUsername(username, user);
  }

  @MessagePattern('user/find/by/username', { transport: Transport.REDIS })
  async getOneByUsernameEvent(username: string) {
    return await this.service.getOneByUsername(username);
  }

  @Action(['UPDATE'])
  @Subject(USERS_SUBJECT)
  @UseGuards(JwtGuard)
  @Put(':id')
  async updateOneById(@Param('id') id: string, @Body() data: UpdateUserDto, @ReqUser() user: IUserAuth) {
    return await this.service.updateOneById(id, data, user);
  }

  @Action(['UPDATE'])
  @Subject(USERS_SUBJECT)
  @UseGuards(JwtGuard)
  @Put()
  async updateMany(@Query() filters: FilterUserDto, @Body() data: UpdateUserDto, @ReqUser() user: IUserAuth) {
    return await this.service.updateMany(filters, data, user);
  }

  @Action(['DELETE'])
  @Subject(USERS_SUBJECT)
  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteOneById(@Param('id') id: string, @ReqUser() user: IUserAuth) {
    return await this.service.deleteOneById(id, user);
  }

  @Action(['DELETE'])
  @Subject(USERS_SUBJECT)
  @UseGuards(JwtGuard)
  @Delete()
  async deleteMany(@Query() filters: FilterUserDto, @ReqUser() user: IUserAuth) {
    return await this.service.deleteMany(filters, user);
  }
}

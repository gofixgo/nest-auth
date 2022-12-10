import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqUser } from 'src/common/decorators/req-user.decorator';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { CreateUserDto } from './dto/create.dto';
import { FilterUserDto } from './dto/filter.dto';
import { UpdateUserDto } from './dto/update.dto';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  async create(@Body() data: CreateUserDto, @ReqUser() user: IUserAuth) {
    return await this.service.create(data, user);
  }

  @Get()
  async getMany(@Query() filters: FilterUserDto, @ReqUser() user: IUserAuth) {
    return await this.service.getMany(filters, user);
  }

  @Get(':id')
  async getOneById(@Param('id') id: string, @ReqUser() user: IUserAuth) {
    return await this.service.getOneById(id, user);
  }

  @Get(':username/username')
  async getOneByUsername(@Param('username') id: string, @ReqUser() user: IUserAuth) {
    return await this.service.getOneByUsername(id, user);
  }

  @Put(':id')
  async updateOneById(@Param('id') id: string, @Body() data: UpdateUserDto, @ReqUser() user: IUserAuth) {
    return await this.service.updateOneById(id, data, user);
  }

  @Put()
  async updateMany(@Query() filters: FilterUserDto, @Body() data: UpdateUserDto, @ReqUser() user: IUserAuth) {
    return await this.service.updateMany(filters, data, user);
  }

  @Delete(':id')
  async deleteOneById(@Param('id') id: string, @ReqUser() user: IUserAuth) {
    return await this.service.deleteOneById(id, user);
  }

  @Delete()
  async deleteMany(@Query() filters: FilterUserDto, @ReqUser() user: IUserAuth) {
    return await this.service.deleteMany(filters, user);
  }
}

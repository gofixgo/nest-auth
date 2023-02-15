import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { ACTION_METADATA } from 'src/common/decorators/action-metadata.decorator';
import { SUBJECT_METADATA } from 'src/common/decorators/subject-metadata.decorator';
import { lastValueFrom } from 'rxjs';
import { CASL_TOKEN } from './casl.module';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, @Inject(CASL_TOKEN) private readonly client: ClientProxy) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as IUserAuth;
    const data = { ...(req.body ?? {}), ...(req.query ?? {}), ...(req.params ?? {}) };
    const subject = this.reflector.get<string>(SUBJECT_METADATA, context.getHandler());
    const actions = this.reflector.get<string[]>(ACTION_METADATA, context.getHandler());
    try {
      const canActivate = this.client.send('casl.guard.canActivate', { subject, actions, data, user });
      const result = await lastValueFrom(canActivate);
      if (result.hasAccess) return true;
      else throw new ForbiddenException(result.message);
    } catch (e) {
      if (e instanceof ForbiddenException) throw new ForbiddenException(e.message);
      else throw new InternalServerErrorException('خطایی حین بررسی دسترسی شما رخ داد.');
    }
  }
}

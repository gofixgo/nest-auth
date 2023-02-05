import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { CASL_TOKEN } from '../user/user.module';
import { Request } from 'express';
import { ACTION_METADATA } from 'src/common/decorators/action-metadata.decorator';
import { SUBJECT_METADATA } from 'src/common/decorators/subject-metadata.decorator';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(@Inject(CASL_TOKEN) private readonly client: ClientProxy, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user;
    const data = { ...(req.body ?? {}), ...(req.query ?? {}), ...(req.params ?? {}) };
    const subject = this.reflector.get<string>(SUBJECT_METADATA, context.getHandler());
    const action = this.reflector.get<string>(ACTION_METADATA, context.getHandler());
    return await lastValueFrom(this.client.send('casl.guard.canActivate', { subject, action, data, user }));
  }
}

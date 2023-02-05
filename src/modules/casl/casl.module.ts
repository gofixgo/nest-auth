import { Global, Module } from '@nestjs/common';
import { CASL_PROVIDER } from '../user/user.module';
import { CaslGuard } from './casl.guard';

@Global()
@Module({
  providers: [CASL_PROVIDER, CaslGuard],
  exports: [CASL_PROVIDER, CaslGuard],
})
export class CaslModule {}

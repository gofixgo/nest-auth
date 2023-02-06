import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, Provider } from '@nestjs/common';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserHelper } from './user.helper';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const CASL_TOKEN = 'CASL_TOKEN';
const CASL_PROVIDER: Provider = {
  provide: CASL_TOKEN,
  useFactory: () => {
    const { CASL_MICROSERVICE_HOST, CASL_MICROSERVICE_PORT } = process.env;
    return ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { host: CASL_MICROSERVICE_HOST, port: parseInt(CASL_MICROSERVICE_PORT) },
    });
  },
};

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserHelper, CASL_PROVIDER],
  exports: [UserService, UserHelper, CASL_PROVIDER],
})
export class UserModule {}

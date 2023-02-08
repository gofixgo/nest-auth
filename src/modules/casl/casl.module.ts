import { forwardRef, Global, Module, Provider } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { CaslGuard } from './casl.guard';

export const CASL_TOKEN = 'CASL_TOKEN';
export const CASL_PROVIDER: Provider = {
  provide: CASL_TOKEN,
  useFactory: () => {
    const { CASL_MICROSERVICE_HOST, CASL_MICROSERVICE_PORT } = process.env;
    return ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { host: CASL_MICROSERVICE_HOST, port: parseInt(CASL_MICROSERVICE_PORT) },
    });
  },
};

@Global()
@Module({
  providers: [CASL_PROVIDER],
  exports: [CASL_PROVIDER],
})
export class CaslModule {}

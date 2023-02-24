import { forwardRef, Global, Module, Provider } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { CaslGuard } from './casl.guard';

export const CASL_TOKEN = 'CASL_TOKEN';
export const CASL_PROVIDER: Provider = {
  provide: CASL_TOKEN,
  useFactory: () => {
    // return ClientProxyFactory.create({ transport: Transport.NATS, options: { servers: ['nats://localhost:4222'] } });
    return ClientProxyFactory.create({ transport: Transport.TCP, options: { host: 'localhost', port: 9991 } });
  },
};

@Global()
@Module({
  providers: [CASL_PROVIDER],
  exports: [CASL_PROVIDER],
})
export class CaslModule {}

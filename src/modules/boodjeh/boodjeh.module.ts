import { FactoryProvider, Global, Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const BOODJEH_TOKEN = 'BOODJEH_TOKEN';
const BOODJEH_PROVIDER: FactoryProvider = {
  provide: BOODJEH_TOKEN,
  useFactory: () => {
    // return ClientProxyFactory.create({ transport: Transport.NATS, options: { servers: ['nats://localhost:4222'] } });
    return ClientProxyFactory.create({ transport: Transport.TCP, options: { host: 'localhost', port: 9993 } });
  },
};

@Global()
@Module({
  exports: [BOODJEH_PROVIDER],
  providers: [BOODJEH_PROVIDER],
})
export class BoodjehModule {}

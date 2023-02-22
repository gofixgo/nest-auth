import { FactoryProvider, Global, Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const BOODJEH_TOKEN = 'BOODJEH_TOKEN';
const BOODJEH_PROVIDER: FactoryProvider = {
  provide: BOODJEH_TOKEN,
  useFactory: () => {
    const { BOODJEH_SERVICE_HOST, BOODJEH_SERVICE_PORT } = process.env;
    return ClientProxyFactory.create({ transport: Transport.REDIS as any, options: { host: BOODJEH_SERVICE_HOST, port: BOODJEH_SERVICE_PORT } });
  },
};

@Global()
@Module({
  exports: [BOODJEH_PROVIDER],
  providers: [BOODJEH_PROVIDER],
})
export class BoodjehModule {}

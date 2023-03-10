import * as cors from 'cors';
import * as path from 'path';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import { CustomExceptionFilter } from './common/filters/customExceptionFilter';
import { Transport } from '@nestjs/microservices';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const PORT = process.env.PORT;
  const { NATS_HOST, NATS_PORT } = process.env;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:4200',
        'http://localhost:4201',
        'http://localhost:8081',
        'http://localhost:4998',
        'http://localhost:4999',
        'http://localhost:7777',
        'http://localhost:7776',
        'http://localhost:8081',
        'http://151.241.219.244:7776',
        'http://151.241.219.244:8081',
        'http://151.241.219.244:8082',
        'http://151.241.219.244:4998',
        'http://151.241.219.244:4999',
        'http://151.241.219.244:7777',
        'http://192.168.1.200:7776',
        'http://192.168.1.200:8081',
        'http://192.168.1.200:8082',
        'http://192.168.1.200:4998',
        'http://192.168.1.200:4999',
        'http://192.168.1.200:7777',
        'http://192.168.1.37:3000',
        'http://192.168.1.37:7777',
        'http://192.168.1.37:7776',
        'http://192.168.1.37:4998',
        'http://192.168.1.37:4999',
        'http://192.168.1.58:3000',
        'http://192.168.1.58:7777',
        'http://192.168.1.58:7776',
        'http://192.168.1.58:4998',
        'http://192.168.1.58:4999',
        'http://192.168.1.38:3000',
        'http://192.168.1.38:7777',
        'http://192.168.1.38:7776',
        'http://192.168.1.38:4998',
        'http://192.168.1.38:4999',
        'http://192.168.43.173:3000',
        'http://192.168.43.173:7777',
        'http://192.168.43.173:7776',
        'http://192.168.43.173:4998',
        'http://192.168.43.173:4999',
      ],
      credentials: true,
    }),
  );
  app.useStaticAssets(path.join(process.cwd(), 'public'));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new CustomExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.connectMicroservice({ transport: Transport.TCP, options: { host: 'localhost', port: 9990 } }, { inheritAppConfig: true });

  await app.get(MikroORM).getMigrator().up();
  await app.get(MikroORM).getSchemaGenerator().ensureDatabase();
  await app.get(MikroORM).getSchemaGenerator().updateSchema();
  app.use((req: Request, res: Response, next: NextFunction) => {
    RequestContext.create(app.get(MikroORM).em, next);
  });

  const config = new DocumentBuilder().setTitle('Auth-System').addBearerAuth().setVersion('1.0.0').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.startAllMicroservices();
  await app.listen(PORT).then(() => console.log('server is running on port ' + PORT));
}
bootstrap();

import { TSMigrationGenerator } from '@mikro-orm/migrations';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { Logger } from '@nestjs/common';

const db_username = process.env.POSTGRES_USER;
const db_password = process.env.POSTGRES_PASSWORD;
const db_name = process.env.POSTGRES_DB;
const db_host = process.env.POSTGRES_HOST;
const db_port = process.env.POSTGRES_PORT;

export default {
  debug: true,
  metadataProvider: TsMorphMetadataProvider,
  logger: (message) => Logger.log(message),
  highlighter: new SqlHighlighter(),
  entities: ['./**/*.entity.js'],
  entitiesTs: ['./**/*.entity.ts'],
  user: db_username,
  password: db_password,
  dbName: db_name,
  host: db_host,
  port: parseInt(db_port),
  type: 'postgresql',
  autoLoadEntities: true,
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: './migrations',
    pathTs: './migrations',
    glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
    transactional: true,
    disableForeignKeys: true,
    allOrNothing: true,
    dropTables: true,
    safe: true,
    snapshot: true,
    emit: 'ts',
    generator: TSMigrationGenerator,
  },
} as MikroOrmModuleSyncOptions;

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  loggerConfig,
  emailConfig,
} from '@config';
import { LoggingModule, HttpClientModule, EmailModule } from '@shared';
import { UsersModule } from '@users';
import { AuthModule } from '@auth';

const envFile = `environment/.env.${process.env.APP_ENV || 'dev'}`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, loggerConfig, emailConfig],
      envFilePath: envFile,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 200,
      },
      {
        name: 'login',
        ttl: 300000,
        limit: 10,
      },
      {
        name: 'register',
        ttl: 600000,
        limit: 10,
      },
      {
        name: 'refresh',
        ttl: 60000,
        limit: 30,
      },
    ]),
    LoggingModule,
    HttpClientModule,
    EmailModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('database.synchronize'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

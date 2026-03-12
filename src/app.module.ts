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
  cacheConfig,
  strapiConfig,
  throttleConfig,
} from '@config';
import {
  LoggingModule,
  HttpClientModule,
  EmailModule,
  CacheModule,
} from '@shared';
import { UsersModule } from '@users';
import { AuthModule } from '@auth';
import { StrapiModule } from '@strapi';

const envFile = `environment/.env.${process.env.APP_ENV || 'dev'}`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        loggerConfig,
        emailConfig,
        cacheConfig,
        strapiConfig,
        throttleConfig,
      ],
      envFilePath: envFile,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'default',
          ttl: configService.getOrThrow<number>('throttle.default.ttl'),
          limit: configService.getOrThrow<number>('throttle.default.limit'),
        },
        {
          name: 'login',
          ttl: configService.getOrThrow<number>('throttle.login.ttl'),
          limit: configService.getOrThrow<number>('throttle.login.limit'),
        },
        {
          name: 'register',
          ttl: configService.getOrThrow<number>('throttle.register.ttl'),
          limit: configService.getOrThrow<number>('throttle.register.limit'),
        },
        {
          name: 'refresh',
          ttl: configService.getOrThrow<number>('throttle.refresh.ttl'),
          limit: configService.getOrThrow<number>('throttle.refresh.limit'),
        },
        {
          name: 'strapi',
          ttl: configService.getOrThrow<number>('throttle.strapi.ttl'),
          limit: configService.getOrThrow<number>('throttle.strapi.limit'),
        },
      ],
      inject: [ConfigService],
    }),
    LoggingModule,
    HttpClientModule,
    EmailModule,
    CacheModule,
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
    StrapiModule,
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

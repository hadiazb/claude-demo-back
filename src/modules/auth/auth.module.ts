import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { INJECTION_TOKENS } from '@shared';
import { UsersModule } from '@users';
import { AuthController } from '@auth/infrastructure/adapters';
import { AuthService } from '@auth/application/services';
import {
  JwtStrategy,
  JwtRefreshStrategy,
} from '@auth/infrastructure/strategies';
import { JwtAuthGuard, JwtRefreshGuard } from '@auth/infrastructure/guards';
import { TokenRepositoryAdapter } from '@auth/infrastructure/adapters';
import { RefreshTokenOrmEntity } from '@auth/infrastructure/persistence';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.accessSecret');
        return {
          secret,
          signOptions: {
            expiresIn: 900, // 15 minutes in seconds
          },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([RefreshTokenOrmEntity]),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    JwtRefreshGuard,
    TokenRepositoryAdapter,
    {
      provide: INJECTION_TOKENS.TOKEN_REPOSITORY,
      useClass: TokenRepositoryAdapter,
    },
  ],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}

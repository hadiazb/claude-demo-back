import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './infrastructure/adapters/in/auth.controller';
import { AuthService } from './application/services/auth.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { JwtRefreshGuard } from './infrastructure/guards/jwt-refresh.guard';
import { TokenRepositoryAdapter } from './infrastructure/adapters/out/token.repository.adapter';
import { RefreshTokenOrmEntity } from './infrastructure/persistence/entities/refresh-token.orm-entity';
import { UsersModule } from '../users/users.module';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';

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

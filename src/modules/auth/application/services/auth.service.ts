import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../../../users/application/services/user.service';
import { TokenRepositoryPort } from '../../domain/ports/out/token.repository.port';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { LoginCommand, AuthTokens } from '../../domain/ports/in/login.use-case';
import {
  RegisterCommand,
  RegisterResult,
} from '../../domain/ports/in/register.use-case';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(INJECTION_TOKENS.TOKEN_REPOSITORY)
    private readonly tokenRepository: TokenRepositoryPort,
  ) {}

  async login(command: LoginCommand): Promise<AuthTokens> {
    const user = await this.userService.findByEmail(command.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(command.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    return this.generateTokens(user.id, user.email.getValue());
  }

  async register(command: RegisterCommand): Promise<RegisterResult> {
    const existingUser = await this.userService.findByEmail(command.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.userService.createUser({
      email: command.email,
      password: command.password,
      firstName: command.firstName,
      lastName: command.lastName,
      role: command.role,
      avatarUrl: command.avatarUrl,
    });

    const tokens = await this.generateTokens(user.id, user.email.getValue());

    return {
      ...tokens,
      userId: user.id,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const storedToken =
      await this.tokenRepository.findRefreshToken(refreshToken);

    if (!storedToken || !storedToken.isValid()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userService.findById(storedToken.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or disabled');
    }

    await this.tokenRepository.revokeRefreshToken(refreshToken);

    return this.generateTokens(user.id, user.email.getValue());
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenRepository.revokeRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.tokenRepository.revokeAllUserTokens(userId);
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const payload = { sub: userId, email };

    const accessSecret = this.configService.get<string>('jwt.accessSecret')!;
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret')!;

    const accessOptions: JwtSignOptions = {
      secret: accessSecret,
      expiresIn: 900, // 15 minutes in seconds
    };

    const refreshOptions: JwtSignOptions = {
      secret: refreshSecret,
      expiresIn: 604800, // 7 days in seconds
    };

    const accessToken = this.jwtService.sign(payload, accessOptions);
    const refreshToken = this.jwtService.sign(payload, refreshOptions);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshTokenEntity = new RefreshToken({
      id: uuidv4(),
      token: refreshToken,
      userId,
      expiresAt,
      isRevoked: false,
    });

    await this.tokenRepository.saveRefreshToken(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  validateAccessToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });
    } catch {
      return null;
    }
  }
}

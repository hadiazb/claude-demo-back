import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { UserController } from './infrastructure/adapters/in/user.controller';
import { UserService } from './application/services/user.service';
import { UserRepositoryAdapter } from './infrastructure/adapters/out/user.repository.adapter';
import { userProviders } from './infrastructure/providers/user.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    forwardRef((): typeof AuthModule => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepositoryAdapter, ...userProviders],
  exports: [UserService],
})
export class UsersModule {}

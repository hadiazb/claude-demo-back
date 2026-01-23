import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@auth';
import { UserOrmEntity } from '@users/infrastructure/persistence';
import { UserController } from '@users/infrastructure/adapters';
import { UserService } from '@users/application/services';
import { UserRepositoryAdapter } from '@users/infrastructure/adapters';
import { userProviders } from '@users/infrastructure/providers';

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

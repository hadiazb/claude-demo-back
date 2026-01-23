import { Provider } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared';
import { UserRepositoryAdapter } from '@users/infrastructure/adapters';

export const userProviders: Provider[] = [
  {
    provide: INJECTION_TOKENS.USER_REPOSITORY,
    useClass: UserRepositoryAdapter,
  },
];

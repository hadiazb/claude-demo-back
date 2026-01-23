import { Provider } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../../shared/constants/injection-tokens';
import { UserRepositoryAdapter } from '../adapters/out/user.repository.adapter';

export const userProviders: Provider[] = [
  {
    provide: INJECTION_TOKENS.USER_REPOSITORY,
    useClass: UserRepositoryAdapter,
  },
];

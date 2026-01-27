import { Provider } from '@nestjs/common';
import { INJECTION_TOKENS } from '@shared';
import { UserRepositoryAdapter } from '@users/infrastructure/adapters';

/**
 * NestJS dependency injection providers for the Users module.
 * Configures the binding between abstract ports and concrete adapters.
 *
 * @description
 * - USER_REPOSITORY token: Binds the UserRepositoryPort interface to UserRepositoryAdapter implementation.
 *   This enables dependency inversion, allowing the domain layer to depend on abstractions
 *   rather than concrete infrastructure implementations.
 */
export const userProviders: Provider[] = [
  {
    provide: INJECTION_TOKENS.USER_REPOSITORY,
    useClass: UserRepositoryAdapter,
  },
];

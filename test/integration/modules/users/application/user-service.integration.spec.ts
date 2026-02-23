import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '@users/application/services';
import { UserRepositoryAdapter } from '@users/infrastructure/adapters/out/user.repository.adapter';
import { UserOrmEntity } from '@users/infrastructure/persistence/entities/user.orm-entity';
import { User, UserRole, Email } from '@users/domain';
import { INJECTION_TOKENS } from '@shared';
import { validUserData } from '../../../../fixtures/user.fixture';

describe('UserService (Integration)', () => {
  let service: UserService;
  let mockOrmRepo: jest.Mocked<Repository<UserOrmEntity>>;

  const now = new Date();

  const createOrmEntity = (
    overrides: Partial<UserOrmEntity> = {},
  ): UserOrmEntity => {
    const entity = new UserOrmEntity();
    entity.id = 'user-uuid-1';
    entity.email = 'test@example.com';
    entity.password = '$2b$10$hashedpasswordvalue';
    entity.firstName = 'John';
    entity.lastName = 'Doe';
    entity.age = 25;
    entity.role = UserRole.USER;
    entity.isActive = true;
    entity.avatarUrl = null;
    entity.createdAt = now;
    entity.updatedAt = now;
    Object.assign(entity, overrides);
    return entity;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryAdapter,
        {
          provide: INJECTION_TOKENS.USER_REPOSITORY,
          useExisting: UserRepositoryAdapter,
        },
        UserService,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UserService);
    mockOrmRepo = module.get(getRepositoryToken(UserOrmEntity));
  });

  describe('createUser', () => {
    it('should create user with value objects, generate UUID, and persist via adapter', async () => {
      mockOrmRepo.count.mockResolvedValue(0); // existsByEmail returns false
      mockOrmRepo.save.mockImplementation((entity: any) => {
        return Promise.resolve({
          ...entity,
          createdAt: now,
          updatedAt: now,
        } as UserOrmEntity);
      });

      const result = await service.createUser({
        email: validUserData.email,
        password: validUserData.password,
        firstName: validUserData.firstName,
        lastName: validUserData.lastName,
        age: validUserData.age,
        role: validUserData.role,
      });

      expect(result).toBeInstanceOf(User);
      expect(result.email).toBeInstanceOf(Email);
      expect(result.email.getValue()).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.role).toBe(UserRole.USER);
      expect(result.id).toBeDefined();
      expect(mockOrmRepo.count).toHaveBeenCalled();
      expect(mockOrmRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when email is duplicated', async () => {
      mockOrmRepo.count.mockResolvedValue(1); // existsByEmail returns true

      await expect(
        service.createUser({
          email: validUserData.email,
          password: validUserData.password,
          firstName: validUserData.firstName,
          lastName: validUserData.lastName,
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockOrmRepo.save).not.toHaveBeenCalled();
    });

    it('should hash the password before persisting', async () => {
      mockOrmRepo.count.mockResolvedValue(0);
      mockOrmRepo.save.mockImplementation((entity: any) => {
        return Promise.resolve({
          ...entity,
          createdAt: now,
          updatedAt: now,
        } as UserOrmEntity);
      });

      await service.createUser({
        email: validUserData.email,
        password: validUserData.password,
        firstName: validUserData.firstName,
        lastName: validUserData.lastName,
      });

      const savedArg = mockOrmRepo.save.mock.calls[0][0];
      expect(savedArg.password).not.toBe(validUserData.password);
      expect(savedArg.password).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('updateUser', () => {
    it('should find user by id, reconstruct and update', async () => {
      const ormEntity = createOrmEntity();
      mockOrmRepo.findOne.mockResolvedValue(ormEntity);
      mockOrmRepo.save.mockImplementation((entity: any) =>
        Promise.resolve(entity as UserOrmEntity),
      );

      const result = await service.updateUser('user-uuid-1', {
        firstName: 'Updated',
      });

      expect(result).toBeInstanceOf(User);
      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Doe'); // unchanged
      expect(mockOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
      });
      expect(mockOrmRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockOrmRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateUser('nonexistent', { firstName: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserRole', () => {
    it('should throw ForbiddenException when trying to change own role', async () => {
      await expect(
        service.updateUserRole('user-1', UserRole.ADMIN, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when demoting the last admin', async () => {
      const adminOrm = createOrmEntity({
        id: 'admin-1',
        role: UserRole.ADMIN,
        email: 'admin@example.com',
      });
      mockOrmRepo.findOne.mockResolvedValue(adminOrm);
      mockOrmRepo.count.mockResolvedValue(1); // only 1 admin

      await expect(
        service.updateUserRole('admin-1', UserRole.USER, 'other-admin'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update role when business rules are satisfied', async () => {
      const userOrm = createOrmEntity({
        id: 'user-1',
        role: UserRole.USER,
      });
      mockOrmRepo.findOne.mockResolvedValue(userOrm);
      mockOrmRepo.save.mockImplementation((entity: any) =>
        Promise.resolve(entity as UserOrmEntity),
      );

      const result = await service.updateUserRole(
        'user-1',
        UserRole.ADMIN,
        'admin-1',
      );

      expect(result).toBeInstanceOf(User);
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should return user unchanged when role is the same', async () => {
      const userOrm = createOrmEntity({
        id: 'user-1',
        role: UserRole.USER,
      });
      mockOrmRepo.findOne.mockResolvedValue(userOrm);

      const result = await service.updateUserRole(
        'user-1',
        UserRole.USER,
        'admin-1',
      );

      expect(result.role).toBe(UserRole.USER);
      expect(mockOrmRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should delegate to adapter and return domain entity', async () => {
      const ormEntity = createOrmEntity();
      mockOrmRepo.findOne.mockResolvedValue(ormEntity);

      const result = await service.findById('user-uuid-1');

      expect(result).toBeInstanceOf(User);
      expect(result!.id).toBe('user-uuid-1');
    });
  });

  describe('findByEmail', () => {
    it('should delegate to adapter and return domain entity', async () => {
      const ormEntity = createOrmEntity();
      mockOrmRepo.findOne.mockResolvedValue(ormEntity);

      const result = await service.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result!.email.getValue()).toBe('test@example.com');
    });
  });

  describe('findAll', () => {
    it('should delegate to adapter and return all users', async () => {
      mockOrmRepo.find.mockResolvedValue([
        createOrmEntity(),
        createOrmEntity({ id: 'user-2', email: 'other@example.com' }),
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      result.forEach((user) => expect(user).toBeInstanceOf(User));
    });
  });
});

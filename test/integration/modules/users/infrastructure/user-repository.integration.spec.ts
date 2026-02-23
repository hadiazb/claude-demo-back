import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryAdapter } from '@users/infrastructure/adapters/out/user.repository.adapter';
import { UserOrmEntity } from '@users/infrastructure/persistence/entities/user.orm-entity';
import { User, UserRole, Email, Password } from '@users/domain';

describe('UserRepositoryAdapter (Integration)', () => {
  let adapter: UserRepositoryAdapter;
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

  const createDomainUser = (): User => {
    return new User({
      id: 'user-uuid-1',
      email: new Email('test@example.com'),
      password: Password.fromHash('$2b$10$hashedpasswordvalue'),
      firstName: 'John',
      lastName: 'Doe',
      age: 25,
      role: UserRole.USER,
      isActive: true,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryAdapter,
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

    adapter = module.get(UserRepositoryAdapter);
    mockOrmRepo = module.get(getRepositoryToken(UserOrmEntity));
  });

  describe('save', () => {
    it('should persist user and return domain entity', async () => {
      const ormEntity = createOrmEntity();
      mockOrmRepo.save.mockResolvedValue(ormEntity);

      const domainUser = createDomainUser();
      const result = await adapter.save(domainUser);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('user-uuid-1');
      expect(result.email.getValue()).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(mockOrmRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-uuid-1',
          email: 'test@example.com',
        }),
      );
    });

    it('should correctly map domain entity to ORM entity for persistence', async () => {
      const ormEntity = createOrmEntity();
      mockOrmRepo.save.mockResolvedValue(ormEntity);

      const domainUser = createDomainUser();
      await adapter.save(domainUser);

      const savedArg = mockOrmRepo.save.mock.calls[0][0];
      expect(savedArg).toBeInstanceOf(UserOrmEntity);
      expect(savedArg.password).toBe('$2b$10$hashedpasswordvalue');
      expect(savedArg.role).toBe(UserRole.USER);
      expect(savedArg.isActive).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return domain User when found', async () => {
      const ormEntity = createOrmEntity();
      mockOrmRepo.findOne.mockResolvedValue(ormEntity);

      const result = await adapter.findById('user-uuid-1');

      expect(result).toBeInstanceOf(User);
      expect(result!.id).toBe('user-uuid-1');
      expect(result!.email.getValue()).toBe('test@example.com');
      expect(mockOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
      });
    });

    it('should return null when user not found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(null);

      const result = await adapter.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should normalize email to lowercase and search', async () => {
      const ormEntity = createOrmEntity();
      mockOrmRepo.findOne.mockResolvedValue(ormEntity);

      const result = await adapter.findByEmail('TEST@EXAMPLE.COM');

      expect(result).toBeInstanceOf(User);
      expect(mockOrmRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when email not found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(null);

      const result = await adapter.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return mapped array of domain entities', async () => {
      const ormEntities = [
        createOrmEntity(),
        createOrmEntity({
          id: 'user-uuid-2',
          email: 'jane@example.com',
          firstName: 'Jane',
        }),
      ];
      mockOrmRepo.find.mockResolvedValue(ormEntities);

      const result = await adapter.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[1]).toBeInstanceOf(User);
      expect(result[0].id).toBe('user-uuid-1');
      expect(result[1].id).toBe('user-uuid-2');
    });

    it('should return empty array when no users exist', async () => {
      mockOrmRepo.find.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should persist changes and return updated domain entity', async () => {
      const updatedOrm = createOrmEntity({ firstName: 'Updated' });
      mockOrmRepo.save.mockResolvedValue(updatedOrm);

      const domainUser = new User({
        id: 'user-uuid-1',
        email: new Email('test@example.com'),
        password: Password.fromHash('$2b$10$hashedpasswordvalue'),
        firstName: 'Updated',
        lastName: 'Doe',
        age: 25,
        role: UserRole.USER,
        isActive: true,
        avatarUrl: null,
        createdAt: now,
        updatedAt: now,
      });

      const result = await adapter.update(domainUser);

      expect(result).toBeInstanceOf(User);
      expect(result.firstName).toBe('Updated');
      expect(mockOrmRepo.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should call repository.delete with the user id', async () => {
      mockOrmRepo.delete.mockResolvedValue({ affected: 1, raw: {} });

      await adapter.delete('user-uuid-1');

      expect(mockOrmRepo.delete).toHaveBeenCalledWith('user-uuid-1');
    });
  });

  describe('existsByEmail', () => {
    it('should return true when email exists', async () => {
      mockOrmRepo.count.mockResolvedValue(1);

      const result = await adapter.existsByEmail('test@example.com');

      expect(result).toBe(true);
      expect(mockOrmRepo.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return false when email does not exist', async () => {
      mockOrmRepo.count.mockResolvedValue(0);

      const result = await adapter.existsByEmail('nonexistent@example.com');

      expect(result).toBe(false);
    });

    it('should normalize email to lowercase', async () => {
      mockOrmRepo.count.mockResolvedValue(1);

      await adapter.existsByEmail('TEST@EXAMPLE.COM');

      expect(mockOrmRepo.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('countByRole', () => {
    it('should return count filtered by role', async () => {
      mockOrmRepo.count.mockResolvedValue(3);

      const result = await adapter.countByRole(UserRole.ADMIN);

      expect(result).toBe(3);
      expect(mockOrmRepo.count).toHaveBeenCalledWith({
        where: { role: UserRole.ADMIN },
      });
    });

    it('should return 0 when no users with the role exist', async () => {
      mockOrmRepo.count.mockResolvedValue(0);

      const result = await adapter.countByRole(UserRole.ADMIN);

      expect(result).toBe(0);
    });
  });
});

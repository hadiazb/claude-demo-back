import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../../domain/entities/user.entity';

/**
 * TypeORM entity representing the 'users' table in the database.
 * Maps database columns to object properties for ORM operations.
 */
@Entity('users')
export class UserOrmEntity {
  /** Unique identifier for the user (UUID format) */
  @PrimaryColumn('uuid')
  id: string;

  /** User's email address. Must be unique across all users */
  @Column({ unique: true })
  email: string;

  /** Hashed password for user authentication */
  @Column()
  password: string;

  /** User's first name. Mapped to 'first_name' column */
  @Column({ name: 'first_name' })
  firstName: string;

  /** User's last name. Mapped to 'last_name' column */
  @Column({ name: 'last_name' })
  lastName: string;

  /** User's age in years. Nullable field */
  @Column({ name: 'age', type: 'int', nullable: true })
  age: number | null;

  /** User's role for authorization. Defaults to USER */
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  /** Indicates if the user account is active. Defaults to true */
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  /** URL to the user's avatar image. Nullable field */
  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  /** Timestamp automatically set when the record is created */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Timestamp automatically updated when the record is modified */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

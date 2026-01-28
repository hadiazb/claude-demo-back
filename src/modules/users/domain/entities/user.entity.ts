import { BaseEntity } from '@shared/domain';
import { Email } from '@users/domain/value-objects';
import { Password } from '@users/domain/value-objects';

/**
 * Enumeration of available user roles for authorization.
 */
export enum UserRole {
  /** Standard user with basic permissions */
  USER = 'USER',
  /** Administrator with elevated permissions */
  ADMIN = 'ADMIN',
}

/**
 * Interface defining the properties required to construct a User entity.
 * Used as a parameter object for the User constructor.
 */
export interface UserProps {
  /** Unique identifier for the user */
  id: string;
  /** User's email address as a value object */
  email: Email;
  /** User's password as a value object */
  password: Password;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's age in years. Can be null if not provided */
  age: number | null;
  /** User's role for authorization */
  role: UserRole;
  /** Indicates if the user account is active */
  isActive: boolean;
  /** URL to the user's avatar image. Can be null */
  avatarUrl: string | null;
  /** Optional creation timestamp */
  createdAt?: Date;
  /** Optional last update timestamp */
  updatedAt?: Date;
}

/**
 * Domain entity representing a User in the system.
 * Extends BaseEntity to inherit common properties (id, createdAt, updatedAt).
 * Implements immutability through readonly properties.
 */
export class User extends BaseEntity {
  /** User's email address as a validated value object */
  readonly email: Email;

  /** User's hashed password as a value object */
  readonly password: Password;

  /** User's first name */
  readonly firstName: string;

  /** User's last name */
  readonly lastName: string;

  /** User's age in years. Null if not provided */
  readonly age: number | null;

  /** User's role for authorization (USER or ADMIN) */
  readonly role: UserRole;

  /** Indicates if the user account is currently active */
  readonly isActive: boolean;

  /** URL to the user's avatar image. Null if not set */
  readonly avatarUrl: string | null;

  /**
   * Creates a new User entity instance.
   * @param props - Object containing all required user properties
   */
  constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this.email = props.email;
    this.password = props.password;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.age = props.age;
    this.role = props.role;
    this.isActive = props.isActive;
    this.avatarUrl = props.avatarUrl;
  }

  /**
   * Returns the user's full name by combining first and last name.
   * @returns The concatenated first and last name with a space separator
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Validates a plain text password against the user's stored password hash.
   * Delegates to the Password value object for secure comparison.
   * @param plainPassword - The plain text password to verify
   * @returns Promise resolving to true if the password matches, false otherwise
   */
  async validatePassword(plainPassword: string): Promise<boolean> {
    return await this.password.compare(plainPassword);
  }
}

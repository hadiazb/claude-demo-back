import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * Value Object representing a user's password.
 * Encapsulates password hashing and comparison logic using bcrypt.
 * Implements immutability by storing only the hashed value.
 */
export class Password {
  /** The bcrypt-hashed password value */
  private readonly hashedValue: string;

  /** Number of salt rounds for bcrypt hashing */
  private static readonly SALT_ROUNDS = 10;

  /** Minimum required length for plain text passwords */
  private static readonly MIN_LENGTH = 8;

  /**
   * Private constructor to enforce factory method usage.
   * @param hashedValue - The already-hashed password string
   */
  private constructor(hashedValue: string) {
    this.hashedValue = hashedValue;
  }

  /**
   * Creates a new Password instance from a plain text password.
   * Validates minimum length and hashes the password using bcrypt.
   * @param plainPassword - The plain text password to hash
   * @returns Promise resolving to a new Password instance
   * @throws BadRequestException if password is too short or empty
   */
  static async create(plainPassword: string): Promise<Password> {
    if (!plainPassword || plainPassword.length < Password.MIN_LENGTH) {
      throw new BadRequestException(
        `Password must be at least ${Password.MIN_LENGTH} characters long`,
      );
    }

    const hashedValue = await bcrypt.hash(plainPassword, Password.SALT_ROUNDS);
    return new Password(hashedValue);
  }

  /**
   * Creates a Password instance from an already-hashed value.
   * Used when reconstructing the value object from persistence.
   * @param hashedValue - The pre-hashed password string from storage
   * @returns A new Password instance wrapping the hashed value
   */
  static fromHash(hashedValue: string): Password {
    return new Password(hashedValue);
  }

  /**
   * Compares a plain text password against the stored hash.
   * Uses bcrypt's secure comparison to prevent timing attacks.
   * @param plainPassword - The plain text password to verify
   * @returns Promise resolving to true if passwords match, false otherwise
   */
  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  /**
   * Returns the hashed password value for persistence.
   * @returns The bcrypt-hashed password string
   */
  getValue(): string {
    return this.hashedValue;
  }
}

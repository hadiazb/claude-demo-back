import { BadRequestException } from '@nestjs/common';

/**
 * Value Object representing a user's email address.
 * Encapsulates email validation and normalization logic.
 * Implements immutability by storing the normalized value as readonly.
 */
export class Email {
  /** The normalized (lowercase, trimmed) email address */
  private readonly value: string;

  /**
   * Creates a new Email instance after validating the format.
   * Normalizes the email by converting to lowercase and trimming whitespace.
   * @param email - The email address string to validate and store
   * @throws BadRequestException if the email format is invalid
   */
  constructor(email: string) {
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }
    this.value = email.toLowerCase().trim();
  }

  /**
   * Validates the email format using a regular expression.
   * Checks for basic email structure: local-part@domain.extension
   * @param email - The email address to validate
   * @returns True if the email matches the expected format, false otherwise
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Returns the normalized email value for persistence or display.
   * @returns The lowercase, trimmed email address string
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Compares this email with another Email instance for equality.
   * Comparison is case-insensitive since emails are normalized on creation.
   * @param other - The Email instance to compare against
   * @returns True if both emails have the same value, false otherwise
   */
  equals(other: Email): boolean {
    return this.value === other.getValue();
  }
}
